import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = express.Router();

// Public routes (no authentication required)
router.post(
  "/register",
  validateRequest(AuthValidation.register),
  AuthController.register
);

router.post(
  "/login",
  validateRequest(AuthValidation.login),
  AuthController.login
);

// Protected routes (authentication required)
router.get("/me", auth(), AuthController.getMe);

router.post(
  "/change-password",
  auth(),
  validateRequest(AuthValidation.changePassword),
  AuthController.changePassword
);

router.post("/logout", auth(), AuthController.logout);

export const AuthRoutes = router;
