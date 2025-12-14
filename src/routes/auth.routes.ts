import { Router } from "express";
import { signUp, login } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { signUpSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

router
  .post("/signup", validateBody(signUpSchema), signUp)
  .post("/login", validateBody(loginSchema), login);

export default router;
