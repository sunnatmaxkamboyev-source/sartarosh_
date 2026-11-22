import Profile from "../models/Profile.js";
import { parseProfileInput } from "../utils/validate.js";

const getOrCreate = async () =>
  (await Profile.findOne()) ||
  (await Profile.create({ name: "Sartarosh Ismi", title: "Barber" }));

export const getProfile = async (req, res) => {
  res.json(await getOrCreate());
};

export const updateProfile = async (req, res) => {
  const { data, error } = parseProfileInput(req.body);
  if (error) return res.status(400).json({ message: error });

  const profile = await getOrCreate();
  profile.set(data);
  await profile.save();
  res.json(profile);
};