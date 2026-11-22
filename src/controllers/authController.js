import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";
import { isValidPhone } from "../utils/validate.js";

export const login = async (req, res) => {
  const { phone, password } = req.body;

  if (!isValidPhone(phone) || !password) {
    return res
      .status(400)
      .json({ message: "Telefon raqam va parolni kiriting" });
  }

  const admin = await Admin.findOne({ phone });
  const ok = admin && (await bcrypt.compare(password, admin.passwordHash));

  if (!ok) {
    return res
      .status(401)
      .json({ message: "Telefon raqam yoki parol noto'g'ri" });
  }

  const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({ token, phone: admin.phone });
};

// Token hali yaroqlimi tekshirish uchun (frontend keyin ishlatadi)
export const me = async (req, res) => {
  res.json({ phone: req.admin.phone });
};