import Service from "../models/Service.js";
import { parseServiceInput } from "../utils/validate.js";

export const listServices = async (req, res) => {
  const services = await Service.find().sort({ createdAt: 1 });
  res.json(services);
};

export const createService = async (req, res) => {
  const { data, error } = parseServiceInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const service = await Service.create(data);
  res.status(201).json(service);
};

export const updateService = async (req, res) => {
  const { data, error } = parseServiceInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const service = await Service.findByIdAndUpdate(req.params.id, data, {
    new: true,
  });
  if (!service) return res.status(404).json({ message: "Xizmat topilmadi" });
  res.json(service);
};

export const deleteService = async (req, res) => {
  const service = await Service.findByIdAndDelete(req.params.id);
  if (!service) return res.status(404).json({ message: "Xizmat topilmadi" });
  res.json({ ok: true });
};