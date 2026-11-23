// Ish vaqti: 09:00 dan 22:00 gacha, har bir bron 1 soat
export const WORK_START = 9;
export const WORK_END = 22;
export const SLOT_MINUTES = 60;
export const TIME_ZONE = "Asia/Tashkent";

const pad = (n) => String(n).padStart(2, "0");

// ["09:00", "10:00", ..., "21:00"]
export const generateSlots = () => {
  const slots = [];
  for (
    let m = WORK_START * 60;
    m + SLOT_MINUTES <= WORK_END * 60;
    m += SLOT_MINUTES
  ) {
    slots.push(`${pad(Math.floor(m / 60))}:${pad(m % 60)}`);
  }
  return slots;
};

// Toshkent vaqti bo'yicha hozir: { date: "2026-11-21", minutes: 868 }
const nowInTashkent = () => {
  const [date, time] = new Date()
    .toLocaleString("sv-SE", { timeZone: TIME_ZONE })
    .split(" ");
  const [h, m] = time.split(":").map(Number);
  return { date, minutes: h * 60 + m };
};

// Vaqt o'tib ketganmi
export const isPastSlot = (date, time) => {
  const now = nowInTashkent();
  if (date < now.date) return true;
  if (date > now.date) return false;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m <= now.minutes;
};
// Toshkent vaqti bo'yicha bugungi sana: "2026-11-23"
export const todayKey = () => nowInTashkent().date;