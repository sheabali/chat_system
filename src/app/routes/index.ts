import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.route";
import { ChatRoutes } from "../modules/Chat/chat.route";
import { MessageRoutes } from "../modules/Message/message.route";
import { UploadRoutes } from "../modules/Upload/upload.route";
import { UserRoutes } from "../modules/User/user.route";
import { LiveLocationRoutes } from "../modules/LiveLocation/liveLocation.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/chat",
    route: ChatRoutes,
  },
  {
    path: "/messages",
    route: MessageRoutes,
  },
  {
    path: "/upload",
    route: UploadRoutes,
  },
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/location",
    route: LiveLocationRoutes,
  },
];

moduleRoutes.forEach((r) => router.use(r.path, r.route));

export default router;
