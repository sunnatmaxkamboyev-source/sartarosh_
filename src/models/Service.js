import mongoose from "mongoose";
import { jsonOptions } from "../utils/toJSON.js";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
  },
  { timestamps: true, toJSON: jsonOptions }
);

export default mongoose.model("Service", serviceSchema);