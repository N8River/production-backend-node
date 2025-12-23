import { Router } from "express";
import {
  register,
  login,
  refreshToken,
  logout,
} from "../controllers/auth.controller";
import { validate } from "../middleware/validation.middleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.post("/refresh", validate(refreshTokenSchema), refreshToken);

router.post("/logout", validate(logoutSchema), logout);

export default router;
