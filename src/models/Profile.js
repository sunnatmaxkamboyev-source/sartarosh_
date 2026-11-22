import mongoose from "mongoose";
import { jsonOptions } from "../utils/toJSON.js";

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, default: "Barber", trim: true },
    photo: { type: String, default: "" }, // rasm matn (base64) ko'rinishida
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model("Profile", profileSchema);