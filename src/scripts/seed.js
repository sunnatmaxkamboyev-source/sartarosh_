import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Admin from "../models/Admin.js";
import Profile from "../models/Profile.js";
import Service from "../models/Service.js";

await connectDB();

// Admin
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
await Admin.findOneAndUpdate(
  { phone: process.env.ADMIN_PHONE },
  { phone: process.env.ADMIN_PHONE, passwordHash },
  { upsert: true }
);
console.log("Admin tayyor:", process.env.ADMIN_PHONE);

// Profil (faqat yo'q bo'lsa)
if ((await Profile.countDocuments()) === 0) {
  await Profile.create({ name: "Sartarosh Ismi", title: "Barber" });
  console.log("Profil yaratildi");
}

// Xizmatlar (faqat yo'q bo'lsa)
if ((await Service.countDocuments()) === 0) {
  await Service.insertMany([
    { name: "Soch olish", price: 50000 },
    { name: "Soqol olish", price: 30000 },
    { name: "Soch + soqol", price: 70000 },
    { name: "Bolalar soch olish", price: 40000 },
    { name: "Soch bo'yash", price: 120000 },
  ]);
  console.log("Xizmatlar yaratildi");
}

await mongoose.disconnect();
console.log("Tayyor");