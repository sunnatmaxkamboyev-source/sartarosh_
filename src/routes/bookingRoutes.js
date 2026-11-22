import { Router } from "express";
import {
  createBooking,
  getBookedSlots,
  listBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/booked", asyncHandler(getBookedSlots));
router.post("/", asyncHandler(createBooking));
router.get("/", requireAdmin, asyncHandler(listBookings));
router.patch("/:id/status", requireAdmin, asyncHandler(updateBookingStatus));

export default router;