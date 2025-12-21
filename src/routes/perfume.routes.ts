import { Router } from "express";
import {
  createPerfume,
  updatePerfume,
  getPerfumes,
  getPerfumeById,
  deletePerfume,
} from "../controllers/perfume.controller";
import { recordUsage } from "../controllers/usage.controller";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createPerfumeSchema,
  updatePerfumeSchema,
} from "../validators/perfume.validator";
import { createUsageSchema } from "../validators/usage.validator";
import { authenticate } from "../middlewares/auth.middleware";
const router = Router();

// Protect all perfume endpoints
router.use(authenticate);

router
  .post("/", validateBody(createPerfumeSchema), createPerfume)
  .get("/", getPerfumes)
  .get("/:id", getPerfumeById)
  .put("/:id", validateBody(updatePerfumeSchema), updatePerfume)
  .delete("/:id", deletePerfume);

// Usage recording endpoint
router.post("/:id/usage", validateBody(createUsageSchema), recordUsage);

export default router;
