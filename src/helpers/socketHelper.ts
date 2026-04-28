import { Server } from "socket.io";
import logger from "../utils/logger/logger";

const socket = (io: Server) => {
  io.on("connection", (socket) => {
    logger.info(`⚡ Socket Connected: ${socket.id}`);

    // Join a specific room based on userId (for private notifications/messages)
    socket.on("join", (userId: string) => {
      socket.join(userId);
      logger.info(`👤 User ${userId} joined their private room`);
    });

    // Handle typing indicator
    socket.on("typing", (data: { chatId: string; userId: string; userName: string }) => {
      socket.to(data.chatId).emit("typing", data);
    });

    // Handle stop typing
    socket.on("stopTyping", (data: { chatId: string; userId: string }) => {
      socket.to(data.chatId).emit("stopTyping", data);
    });

    // Join a chat room
    socket.on("joinChat", (chatId: string) => {
      socket.join(chatId);
      logger.info(`💬 Socket ${socket.id} joined chat room: ${chatId}`);
    });

    // Leave a chat room
    socket.on("leaveChat", (chatId: string) => {
      socket.leave(chatId);
      logger.info(`🚪 Socket ${socket.id} left chat room: ${chatId}`);
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });
};

export const SocketHelper = {
  socket,
};
