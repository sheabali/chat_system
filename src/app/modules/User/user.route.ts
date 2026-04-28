import express from "express";
import auth from "../../middlewares/auth";
import { UserController } from "./user.controller";

const router = express.Router();

router.get("/", auth(), UserController.getAllUsers);
router.get("/:id", auth(), UserController.getUserById);

export const UserRoutes = router;
