import crypto from "crypto";
import mongoose from "mongoose";

const randomToken = () => crypto.randomBytes(8).toString("hex");

const bookingSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // "2026-11-20"
    time: { type: String, required: true }, // "10:00"
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true }, // "+998901234567"
    services: [
      {
        _id: false,
        id: String,
        name: String,
        price: Number,
      },
    ],
    note: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["new", "done", "cancelled"],
      default: "new",
    },
    active: { type: Boolean, default: true }, // false = bekor qilingan, vaqt bo'sh

    // Mijozning Telegramini shu bronga bog'lash uchun
    telegramToken: { type: String, default: randomToken, index: true },
    telegramChatId: { type: String, default: "" },

    // Mijoz saytda o'z bronini ko'rishi uchun
    viewToken: { type: String, default: randomToken, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id.toString();
        ret.telegramLinked = Boolean(ret.telegramChatId);
        delete ret._id;
        delete ret.telegramToken;
        delete ret.telegramChatId;
        delete ret.viewToken;
        return ret;
      },
    },
  }
);

// Bir vaqtga faqat bitta faol bron
bookingSchema.index(
  { date: 1, time: 1 },
  { unique: true, partialFilterExpression: { active: true } }
);

export default mongoose.model("Booking", bookingSchema);