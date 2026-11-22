import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

export const requireAdmin = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Avval tizimga kiring" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(payload.id);
    if (!admin) throw new Error("Admin topilmadi");
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ message: "Sessiya tugagan, qayta kiring" });
  }
};