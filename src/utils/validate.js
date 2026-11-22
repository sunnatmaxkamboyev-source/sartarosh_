// +998 va undan keyin 9 ta raqam: +998901234567
export const isValidPhone = (phone) =>
  typeof phone === "string" && /^\+998\d{9}$/.test(phone);

// Xizmat: nom 2-60 belgi, narx musbat butun son
export const parseServiceInput = (body) => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price);

  if (name.length < 2 || name.length > 60) {
    return { error: "Xizmat nomini kiriting (2-60 belgi)" };
  }
  if (!Number.isInteger(price) || price <= 0) {
    return { error: "Narxni to'g'ri kiriting" };
  }
  return { data: { name, price } };
};

// Profil: ism 2-60 belgi, rasm bo'sh yoki "data:image/..." ko'rinishida
export const parseProfileInput = (body) => {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const title =
    typeof body.title === "string" && body.title.trim()
      ? body.title.trim()
      : "Barber";
  const photo = typeof body.photo === "string" ? body.photo : "";

  if (name.length < 2 || name.length > 60) {
    return { error: "Ismni kiriting (2-60 belgi)" };
  }
  if (title.length > 60) {
    return { error: "Lavozim juda uzun" };
  }
  if (photo && !photo.startsWith("data:image/")) {
    return { error: "Rasm formati noto'g'ri" };
  }
  if (photo.length > 1_500_000) {
    return { error: "Rasm hajmi juda katta" };
  }
  return { data: { name, title, photo } };
};
// "2026-12-01" ko'rinishidagi haqiqiy sana
export const isValidDate = (s) => {
  if (typeof s !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00Z");
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};