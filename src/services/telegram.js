import {
  formatDate,
  formatMoney,
  formatPhone,
  slotRange,
} from "../utils/format.js";

const escapeHtml = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Telegram API ga so'rov
export const callTelegram = async (method, payload, timeoutMs = 10000) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const data = await res.json().catch(() => null);
  if (!data?.ok) {
    throw new Error(data?.description || `HTTP ${res.status}`);
  }
  return data.result;
};

// Xabar yuborish. chatId berilmasa, sizga (admin) boradi
export const sendTelegramMessage = async (
  text,
  chatId = process.env.TELEGRAM_CHAT_ID
) => {
  if (!process.env.TELEGRAM_BOT_TOKEN || !chatId) {
    console.warn("Telegram sozlanmagan (.env da token yoki chat id yo'q)");
    return;
  }
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  });
};

// Mijoz botga ulanishi uchun havola
export const getBotLink = (token) => {
  // "@" yoki bo'sh joy tasodifan yozilgan bo'lsa ham to'g'ri ishlasin
  const username = (process.env.TELEGRAM_BOT_USERNAME || "")
    .trim()
    .replace(/^@/, "");
  return username ? `https://t.me/${username}?start=${token}` : null;
};

// Sizga: yangi bron
export const notifyNewBooking = async (booking) => {
  const total = booking.services.reduce((sum, s) => sum + s.price, 0);

  const lines = [
    "🆕 <b>Yangi bron</b>",
    "",
    `📅 ${formatDate(booking.date)}`,
    `🕒 ${slotRange(booking.time)}`,
    `👤 ${escapeHtml(booking.name)}`,
    `📞 ${formatPhone(booking.phone)}`,
    `✂️ ${escapeHtml(booking.services.map((s) => s.name).join(", "))}`,
    `💰 ${formatMoney(total)} so'm`,
  ];
  if (booking.note) lines.push(`📝 ${escapeHtml(booking.note)}`);

  await sendTelegramMessage(lines.join("\n"));
};

// Mijozga: bron bekor qilindi (faqat botga ulangan bo'lsa)
export const notifyClientCancelled = async (booking) => {
  if (!booking.telegramChatId) return;

  const text = [
    "❌ <b>Broningiz bekor qilindi</b>",
    "",
    `📅 ${formatDate(booking.date)}`,
    `🕒 ${slotRange(booking.time)}`,
    "",
    "Qulay boshqa vaqtni saytdan tanlashingiz mumkin.",
  ].join("\n");

  await sendTelegramMessage(text, booking.telegramChatId);
};