import express from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MessageController } from "./message.controller";
import { MessageValidation } from "./message.validation";

const router = express.Router();

// All message routes require authentication
router.use(auth());

// Send a message to a chat
router.post(
  "/:chatId",
  validateRequest(MessageValidation.sendMessage),
  MessageController.sendMessage
);

// Get messages for a chat (paginated)
router.get(
  "/:chatId",
  validateRequest(MessageValidation.getMessages),
  MessageController.getMessages
);

// Update a message (sender only)
router.patch(
  "/:chatId/:messageId",
  validateRequest(MessageValidation.updateMessage),
  MessageController.updateMessage
);

// Delete a message (sender only)
router.delete(
  "/:chatId/:messageId",
  validateRequest(MessageValidation.messageIdParam),
  MessageController.deleteMessage
);

export const MessageRoutes = router;
