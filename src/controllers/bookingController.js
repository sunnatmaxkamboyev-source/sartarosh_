import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import { generateSlots, isPastSlot, todayKey } from "../config/schedule.js";
import { isValidDate, isValidPhone } from "../utils/validate.js";
import {
  getBotLink,
  notifyAdminClientCancelled,
  notifyClientCancelled,
  notifyClientDone,
  notifyNewBooking,
} from "../services/telegram.js";

const isValidToken = (t) =>
  typeof t === "string" && /^[a-f0-9]{16}$/.test(t);

const logError = (label) => (err) =>
  console.error(`${label}:`, err.message);

// Shu kundagi band vaqtlar (mijozlar sahifasi uchun)
export const getBookedSlots = async (req, res) => {
  const { date } = req.query;
  if (!isValidDate(date)) {
    return res.status(400).json({ message: "Sana noto'g'ri" });
  }
  const bookings = await Booking.find({ date, active: true }).select("time");
  res.json(bookings.map((b) => b.time));
};

// Yangi bron (mijoz)
export const createBooking = async (req, res) => {
  const { date, time, phone, serviceIds, note } = req.body;
  const name = typeof req.body.name === "string" ? req.body.name.trim() : "";

  if (!isValidDate(date)) {
    return res.status(400).json({ message: "Sana noto'g'ri" });
  }
  if (!generateSlots().includes(time)) {
    return res.status(400).json({ message: "Vaqt noto'g'ri" });
  }
  if (isPastSlot(date, time)) {
    return res.status(400).json({ message: "Bu vaqt o'tib ketgan" });
  }
  if (name.length < 2 || name.length > 60) {
    return res.status(400).json({ message: "Ismni kiriting" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ message: "Telefon raqam noto'g'ri" });
  }
  if (!Array.isArray(serviceIds) || serviceIds.length === 0) {
    return res.status(400).json({ message: "Kamida bitta xizmatni tanlang" });
  }
  if (note && (typeof note !== "string" || note.length > 300)) {
    return res.status(400).json({ message: "Izoh juda uzun" });
  }

  // Xizmatlar bazada borligini tekshiramiz, nom va narxini bron ichiga nusxalaymiz
  const ids = [...new Set(serviceIds)];
  const services = await Service.find({ _id: { $in: ids } });
  if (services.length !== ids.length) {
    return res.status(400).json({ message: "Tanlangan xizmat topilmadi" });
  }

  try {
    const booking = await Booking.create({
      date,
      time,
      name,
      phone,
      note: note ? note.trim() : "",
      services: services.map((s) => ({
        id: s.id,
        name: s.name,
        price: s.price,
      })),
    });

    // Sizga xabar (kutmaymiz: xabar bormasa ham bron saqlanadi)
    notifyNewBooking(booking).catch(logError("Telegramga yuborilmadi"));

    // Mijozga: Telegram havolasi va saytda ko'rish uchun kod
    res.status(201).json({
      ...booking.toJSON(),
      telegramLink: getBotLink(booking.telegramToken),
      viewToken: booking.viewToken,
    });
  } catch (err) {
    // Bir vaqtga boshqa odam ulgurib bron qilib qo'ygan
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bu vaqt band bo'lib qoldi" });
    }
    throw err;
  }
};

// Mijozning o'z bronlari (kodlar bo'yicha). Shaxsiy ma'lumot qaytarilmaydi
export const getMyBookings = async (req, res) => {
  const { tokens } = req.body;
  const valid =
    Array.isArray(tokens) &&
    tokens.length > 0 &&
    tokens.length <= 20 &&
    tokens.every(isValidToken);

  if (!valid) {
    return res.status(400).json({ message: "So'rov noto'g'ri" });
  }

  const bookings = await Booking.find({ viewToken: { $in: tokens } }).sort({
    date: 1,
    time: 1,
  });

  res.json(
    bookings.map((b) => ({
      id: b.id,
      token: b.viewToken, // mijozning o'z kodi, bekor qilish uchun kerak
      date: b.date,
      time: b.time,
      status: b.status,
      services: b.services,
    }))
  );
};

// Mijoz o'z bronini bekor qiladi
export const cancelMyBooking = async (req, res) => {
  const { token } = req.body;
  if (!isValidToken(token)) {
    return res.status(400).json({ message: "So'rov noto'g'ri" });
  }

  const booking = await Booking.findOne({ viewToken: token });
  if (!booking) return res.status(404).json({ message: "Bron topilmadi" });
  if (booking.status !== "new") {
    return res.status(400).json({ message: "Bu bronni bekor qilib bo'lmaydi" });
  }
  if (isPastSlot(booking.date, booking.time)) {
    return res.status(400).json({ message: "Bron vaqti o'tib ketgan" });
  }

  booking.status = "cancelled";
  booking.active = false; // vaqt bo'shaydi
  await booking.save();

  notifyAdminClientCancelled(booking).catch(logError("Adminga yuborilmadi"));
  notifyClientCancelled(booking).catch(logError("Mijozga yuborilmadi"));

  res.json({ ok: true });
};

// Barcha bronlar (admin)
export const listBookings = async (req, res) => {
  const bookings = await Booking.find().sort({ date: 1, time: 1 });
  res.json(bookings);
};

// Holatni o'zgartirish (admin): faqat "yangi" bronni
export const updateBookingStatus = async (req, res) => {
  const { status } = req.body;
  if (!["done", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Holat noto'g'ri" });
  }

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Bron topilmadi" });
  if (booking.status !== "new") {
    return res.status(400).json({ message: "Bu bronning holati o'zgargan" });
  }

  booking.status = status;
  booking.active = status !== "cancelled"; // bekor qilinsa, vaqt bo'shaydi
  await booking.save();

  // Mijozga Telegramdan xabar (ulangan bo'lsa)
  if (status === "cancelled") {
    notifyClientCancelled(booking).catch(logError("Mijozga yuborilmadi"));
  } else {
    notifyClientDone(booking).catch(logError("Mijozga yuborilmadi"));
  }

  res.json(booking);
};

// Bitta bronni o'chirish (admin). "Yangi" bronni o'chirib bo'lmaydi
export const deleteBooking = async (req, res) => {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ message: "Bron topilmadi" });
  if (booking.status === "new") {
    return res.status(400).json({
      message: "Avval bronni bekor qiling yoki «Bajarildi» deb belgilang",
    });
  }

  await booking.deleteOne();
  res.json({ ok: true });
};

// Bugundan oldingi hamma bronlarni o'chirish (admin)
export const clearPastBookings = async (req, res) => {
  const result = await Booking.deleteMany({ date: { $lt: todayKey() } });
  res.json({ deleted: result.deletedCount });
};