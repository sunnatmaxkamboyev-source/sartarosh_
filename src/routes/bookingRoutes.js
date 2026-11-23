import { Router } from "express";
import {
  cancelMyBooking,
  clearPastBookings,
  createBooking,
  deleteBooking,
  getBookedSlots,
  getMyBookings,
  listBookings,
  updateBookingStatus,
} from "../controllers/bookingController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// Hamma uchun
router.get("/booked", asyncHandler(getBookedSlots));
router.post("/mine", asyncHandler(getMyBookings));
router.post("/mine/cancel", asyncHandler(cancelMyBooking));
router.post("/", asyncHandler(createBooking));

// Faqat admin uchun
router.get("/", requireAdmin, asyncHandler(listBookings));
router.patch("/:id/status", requireAdmin, asyncHandler(updateBookingStatus));
router.delete("/past", requireAdmin, asyncHandler(clearPastBookings));
router.delete("/:id", requireAdmin, asyncHandler(deleteBooking));

export default router;