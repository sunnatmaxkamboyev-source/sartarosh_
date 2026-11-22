import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import { generateSlots, isPastSlot } from "../config/schedule.js";
import { isValidDate, isValidPhone } from "../utils/validate.js";
import {
  getBotLink,
  notifyClientCancelled,
  notifyNewBooking,
} from "../services/telegram.js";

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
    notifyNewBooking(booking).catch((err) =>
      console.error("Telegramga yuborilmadi:", err.message)
    );

    // Mijoz botga ulanishi uchun havola ham qaytariladi
    res.status(201).json({
      ...booking.toJSON(),
      telegramLink: getBotLink(booking.telegramToken),
    });
  } catch (err) {
    // Bir vaqtga boshqa odam ulgurib bron qilib qo'ygan
    if (err.code === 11000) {
      return res.status(409).json({ message: "Bu vaqt band bo'lib qoldi" });
    }
    throw err;
  }
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

  // Bekor qilinsa, mijozga Telegramdan xabar (ulangan bo'lsa)
  if (status === "cancelled") {
    notifyClientCancelled(booking).catch((err) =>
      console.error("Mijozga yuborilmadi:", err.message)
    );
  }

  res.json(booking);
};