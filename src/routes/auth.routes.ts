import { Router } from "express";
import { signUp } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { signUpSchema } from "../validators/auth.validator";

const router = Router();

router.post("/signup", validateBody(signUpSchema), signUp);

export default router;
