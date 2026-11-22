import Booking from "../models/Booking.js";
import { callTelegram, sendTelegramMessage } from "./telegram.js";
import { formatDate, slotRange } from "../utils/format.js";

const handleStart = async (message) => {
  const chatId = message.chat.id;
  const payload = (message.text.split(" ")[1] || "").trim();

  // Havolasiz oddiy /start
  if (!payload) {
    await sendTelegramMessage(
      "Salom! Bron qilganingizdan keyin saytdagi «Telegramda xabar olish» tugmasi orqali shu botga ulaning.",
      chatId
    );
    return;
  }

  const booking = await Booking.findOne({ telegramToken: payload });
  if (!booking) {
    await sendTelegramMessage("Havola eskirgan yoki noto'g'ri.", chatId);
    return;
  }

  booking.telegramChatId = String(chatId);
  await booking.save();

  await sendTelegramMessage(
    [
      "✅ <b>Telegram ulandi</b>",
      "",
      `📅 ${formatDate(booking.date)}`,
      `🕒 ${slotRange(booking.time)}`,
      "",
      "Bron o'zgarsa yoki bekor qilinsa, shu yerga xabar keladi.",
    ].join("\n"),
    chatId
  );
};

export const startTelegramBot = () => {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.warn("Telegram bot o'chiq (token yo'q)");
    return;
  }

  let offset = 0;

  const loop = async () => {
    try {
      // Yangi xabarlarni kutamiz (25 soniyagacha)
      const updates = await callTelegram(
        "getUpdates",
        { offset, timeout: 25, allowed_updates: ["message"] },
        35000
      );

      for (const update of updates) {
        offset = update.update_id + 1;
        const message = update.message;
        if (message?.text?.startsWith("/start")) {
          await handleStart(message).catch((err) =>
            console.error("Bot xatosi:", err.message)
          );
        }
      }
    } catch (err) {
      console.error("Telegram polling xatosi:", err.message);
      await new Promise((r) => setTimeout(r, 5000));
    }
    setImmediate(loop);
  };

  console.log("Telegram bot ishga tushdi");
  loop();
};