import mongoose from "mongoose";
import { jsonOptions } from "../utils/toJSON.js";

const adminSchema = new mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true }, // +998901234567
    passwordHash: { type: String, required: true },
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model("Admin", adminSchema);