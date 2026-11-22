import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getProfile));
router.put("/", requireAdmin, asyncHandler(updateProfile));

export default router;