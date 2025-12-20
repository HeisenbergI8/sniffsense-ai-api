import { Router } from "express";
import {
  create,
  update,
  list,
  getById,
  remove,
} from "../controllers/perfume.controller";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createPerfumeSchema,
  updatePerfumeSchema,
} from "../validators/perfume.validator";
import { authenticate } from "../middlewares/auth.middleware";
const router = Router();

// Protect all perfume endpoints
router.use(authenticate);

router
  .post("/", validateBody(createPerfumeSchema), create)
  .get("/", list)
  .get("/:id", getById)
  .put("/:id", validateBody(updatePerfumeSchema), update)
  .delete("/:id", remove);

export default router;
