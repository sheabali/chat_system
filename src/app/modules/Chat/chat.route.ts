import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ChatController } from "./chat.controller";
import { ChatValidation } from "./chat.validation";

const router = express.Router();

// All chat routes require authentication
router.use(auth());

// Create 1-to-1 chat
router.post(
  "/one-to-one",
  validateRequest(ChatValidation.createOneToOneChat),
  ChatController.createOneToOneChat
);

// Create group chat
router.post(
  "/group",
  validateRequest(ChatValidation.createGroupChat),
  ChatController.createGroupChat
);

// Get all my chats
router.get("/", ChatController.getMyChats);

// Get single chat by ID
router.get(
  "/:chatId",
  validateRequest(ChatValidation.chatIdParam),
  ChatController.getChatById
);

// Update group chat (admin only)
router.patch(
  "/:chatId",
  validateRequest(ChatValidation.updateGroupChat),
  ChatController.updateGroupChat
);

// Delete chat
router.delete(
  "/:chatId",
  validateRequest(ChatValidation.chatIdParam),
  ChatController.deleteChat
);

// Add participants to group (admin only)
router.post(
  "/:chatId/participants",
  validateRequest(ChatValidation.addParticipants),
  ChatController.addParticipants
);

// Remove participant from group (admin only)
router.delete(
  "/:chatId/participants/:participantId",
  validateRequest(ChatValidation.removeParticipant),
  ChatController.removeParticipant
);

// Leave group chat
router.post(
  "/:chatId/leave",
  validateRequest(ChatValidation.chatIdParam),
  ChatController.leaveGroupChat
);

export const ChatRoutes = router;
