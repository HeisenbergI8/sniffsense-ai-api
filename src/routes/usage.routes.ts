import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  recordUsage,
  getUsages,
  getPerfumeUsages,
} from "../controllers/usage.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { createUsageSchema } from "../validators/usage.validator";

const router = Router();

// Protect all usage endpoints
router.use(authenticate);

//Get all usages
router
  .get("/usages", getUsages)
  .get("/perfumes/:id/usages", getPerfumeUsages)
  .post("/perfumes/:id/usage", validateBody(createUsageSchema), recordUsage);

export default router;
