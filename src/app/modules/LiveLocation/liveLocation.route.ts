import express from "express";
import auth from "../../middlewares/auth";
import { LiveLocationController } from "./liveLocation.controller";

const router = express.Router();

router.post("/update", auth(), LiveLocationController.updateLocation);
router.get("/chat/:chatId", auth(), LiveLocationController.getChatLocations);

export const LiveLocationRoutes = router;
