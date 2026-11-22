import { SLOT_MINUTES } from "../config/schedule.js";

const pad = (n) => String(n).padStart(2, "0");

// "+998901112233" -> "+998 90 111 22 33"
export const formatPhone = (phone) => {
  const d = phone.replace(/\D/g, "").slice(3);
  return `+998 ${d.slice(0, 2)} ${d.slice(2, 5)} ${d.slice(5, 7)} ${d.slice(7, 9)}`;
};

// "2026-12-01" -> "01.12.2026"
export const formatDate = (key) => key.split("-").reverse().join(".");

// "10:00" -> "10:00 - 11:00"
export const slotRange = (start) => {
  const [h, m] = start.split(":").map(Number);
  const end = h * 60 + m + SLOT_MINUTES;
  return `${start} - ${pad(Math.floor(end / 60))}:${pad(end % 60)}`;
};

// 120000 -> "120 000"
export const formatMoney = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");