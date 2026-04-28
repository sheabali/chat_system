import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import ApiError from "../../../errors/apiError";
import { ISendMessage } from "./message.interface";

// ─── Send a message ───────────────────────────────────────────────────────────
const sendMessage = async (userId: string, chatId: string, payload: ISendMessage) => {
  // Verify user is a participant of this chat
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId },
  });

  if (!participant) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not a participant of this chat"
    );
  }

  // Create the message
  const message = await prisma.message.create({
    data: {
      content: payload.content || null,
      fileUrl: payload.fileUrl || null,
      type: payload.type || "TEXT",
      senderId: userId,
      chatId,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Update the chat's updatedAt to reflect latest activity (for sorting)
  await prisma.chat.update({
    where: { id: chatId },
    data: { updatedAt: new Date() },
  });

  // Emit message to the chat room
  if ((global as any).io) {
    (global as any).io.to(chatId).emit("message", message);
  }

  return message;
};

// ─── Get messages for a chat (paginated) ──────────────────────────────────────
const getMessages = async (
  userId: string,
  chatId: string,
  page: number = 1,
  limit: number = 50
) => {
  // Verify user is a participant
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId },
  });

  if (!participant) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not a participant of this chat"
    );
  }

  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { chatId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.message.count({ where: { chatId } }),
  ]);

  return {
    messages: messages.reverse(), // Return in chronological order
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─── Update a message (sender only) ──────────────────────────────────────────
const updateMessage = async (
  userId: string,
  chatId: string,
  messageId: string,
  content: string
) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      senderId: userId,
    },
  });

  if (!message) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Message not found or you are not the sender"
    );
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { content },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });

  // Emit update to the chat room
  if ((global as any).io) {
    (global as any).io.to(chatId).emit("updateMessage", updated);
  }

  return updated;
};

// ─── Delete a message (sender only) ──────────────────────────────────────────
const deleteMessage = async (
  userId: string,
  chatId: string,
  messageId: string
) => {
  const message = await prisma.message.findFirst({
    where: {
      id: messageId,
      chatId,
      senderId: userId,
    },
  });

  if (!message) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Message not found or you are not the sender"
    );
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  // Emit delete to the chat room
  if ((global as any).io) {
    (global as any).io.to(chatId).emit("deleteMessage", { chatId, messageId });
  }

  return { message: "Message deleted successfully" };
};

export const MessageService = {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
};
