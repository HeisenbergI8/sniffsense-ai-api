import { Router } from "express";
import {
  createPerfume,
  updatePerfume,
  getPerfumes,
  getPerfumeById,
  deletePerfume,
  recommendPerfume,
} from "../controllers/perfume.controller";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createPerfumeSchema,
  updatePerfumeSchema,
} from "../validators/perfume.validator";
import { authenticate } from "../middlewares/auth.middleware";
import { uploadPerfumeImage } from "../middlewares/upload.middleware";
const router = Router();

// Protect all perfume endpoints
router.use(authenticate);

router
  .post(
    "/",
    uploadPerfumeImage,
    validateBody(createPerfumeSchema),
    createPerfume
  )
  .get("/", getPerfumes)
  .get("/recommendation", recommendPerfume)
  .get("/:id", getPerfumeById)
  .put(
    "/:id",
    uploadPerfumeImage,
    validateBody(updatePerfumeSchema),
    updatePerfume
  )
  .delete("/:id", deletePerfume);

export default router;
