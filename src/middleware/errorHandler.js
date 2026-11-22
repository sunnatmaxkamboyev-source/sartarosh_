export const notFound = (req, res) => {
  res.status(404).json({ message: "Topilmadi" });
};

export const errorHandler = (err, req, res, next) => {
  // Noto'g'ri JSON yuborilsa
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Noto'g'ri so'rov" });
  }
  // Rasm juda katta bo'lsa
  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Rasm hajmi juda katta" });
  }
  // Model tekshiruvi (majburiy maydon bo'sh va h.k.)
  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ message: first.message });
  }
  // Noto'g'ri id formati
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Noto'g'ri ma'lumot" });
  }

  console.error(err);
  res.status(500).json({ message: "Serverda xatolik" });
};