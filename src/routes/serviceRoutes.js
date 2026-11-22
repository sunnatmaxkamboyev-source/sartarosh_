import { Router } from "express";
import {
  createService,
  deleteService,
  listServices,
  updateService,
} from "../controllers/serviceController.js";
import { requireAdmin } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(listServices));
router.post("/", requireAdmin, asyncHandler(createService));
router.put("/:id", requireAdmin, asyncHandler(updateService));
router.delete("/:id", requireAdmin, asyncHandler(deleteService));

export default router;