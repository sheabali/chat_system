import { Server, Socket } from "socket.io";
import logger from "../utils/logger/logger";
import prisma from "../lib/prisma";

const socket = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    const user = (socket as any).user;
    if (!user) {
      logger.error(`❌ Socket ${socket.id} connected without user info. Disconnecting...`);
      return socket.disconnect();
    }

    logger.info(`⚡ Socket Connected: ${socket.id} (User: ${user.id})`);

    // Join user's private room for direct messages/notifications
    socket.join(user.id);

    // Broadcast online status
    io.emit("userStatus", { userId: user.id, status: "online" });

    // Fetch chat list
    socket.on("fetchChats", async () => {
      try {
        const chats = await prisma.chat.findMany({
          where: {
            participants: {
              some: { userId: user.id },
            },
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    email: true,
                  },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { updatedAt: "desc" },
        });

        const formattedChats = chats.map(chat => ({
          ...chat,
          lastMessage: chat.messages[0] || null,
        }));

        socket.emit("myAdminChats", formattedChats);
      } catch (error) {
        socket.emit("socketError", { message: "Failed to fetch chats" });
      }
    });

    // Fetch messages for a specific chat
    socket.on("messageList", async (data: { receiverId: string }) => {
      try {
        // Join the chat room to receive real-time updates/typing indicators
        socket.join(data.receiverId);
        
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { chatId: data.receiverId },
              {
                chat: {
                  isGroup: false,
                  participants: {
                    every: {
                      userId: { in: [user.id, data.receiverId] }
                    }
                  }
                }
              }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        });

        socket.emit("messages", messages);
      } catch (error: any) {
        logger.error(`❌ Failed to fetch messages for user ${user.id}:`, error);
        socket.emit("socketError", { message: `Failed to fetch messages: ${error.message}` });
      }
    });

    // Handle sending message
    socket.on("message", async (data: { receiverId: string; message: string }) => {
      try {
        let chat = null;

        // 1. Try to find chat by ID first (in case receiverId is actually a chatId)
        chat = await prisma.chat.findUnique({
          where: { id: data.receiverId },
        });

        // 2. If not found by ID, try to find 1-to-1 chat between user and receiverId
        if (!chat) {
          chat = await prisma.chat.findFirst({
            where: {
              isGroup: false,
              participants: {
                every: {
                  userId: { in: [user.id, data.receiverId] }
                }
              }
            }
          });
        }

        // 3. If still no chat, create a new 1-to-1 chat
        if (!chat) {
          // Verify receiverId is a valid user before creating
          const receiver = await prisma.user.findUnique({ where: { id: data.receiverId } });
          if (!receiver) {
            return socket.emit("socketError", { message: "Recipient user not found" });
          }

          chat = await prisma.chat.create({
            data: {
              isGroup: false,
              creatorId: user.id,
              participants: {
                create: [
                  { userId: user.id, role: "ADMIN" },
                  { userId: data.receiverId, role: "MEMBER" },
                ]
              }
            }
          });
        }

        const newMessage = await prisma.message.create({
          data: {
            content: data.message,
            senderId: user.id,
            chatId: chat.id,
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        });

        // Emit to all participants in the chat
        // We fetch participants to know who to notify
        const participants = await prisma.chatParticipant.findMany({
          where: { chatId: chat.id },
          select: { userId: true },
        });

        participants.forEach((p) => {
          io.to(p.userId).emit("message", newMessage);
        });

      } catch (error: any) {
        logger.error(`❌ Failed to send message from ${user.id}:`, error);
        socket.emit("socketError", { message: `Failed to send message: ${error.message}` });
      }
    });

    // Typing Indicators
    socket.on("typing", (data: { chatId: string }) => {
      socket.to(data.chatId).emit("typing", { chatId: data.chatId, userName: user.name });
    });

    socket.on("stopTyping", (data: { chatId: string }) => {
      socket.to(data.chatId).emit("stopTyping", { chatId: data.chatId });
    });

    socket.on("disconnect", () => {
      logger.info(`🔌 Socket Disconnected: ${socket.id} (User: ${user.id})`);
      io.emit("userStatus", { userId: user.id, status: "offline" });
    });
  });
};

export const SocketHelper = {
  socket,
};
