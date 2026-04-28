import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import ApiError from "../../../errors/apiError";
import {
  ICreateOneToOneChat,
  ICreateGroupChat,
  IUpdateGroupChat,
  IAddParticipants,
} from "./chat.interface";

// ─── Create or get existing 1-to-1 chat ───────────────────────────────────────
const createOneToOneChat = async (userId: string, payload: ICreateOneToOneChat) => {
  const { participantId } = payload;

  // Cannot chat with yourself
  if (userId === participantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You cannot create a chat with yourself");
  }

  // Check if participant exists
  const participant = await prisma.user.findUnique({
    where: { id: participantId },
  });

  if (!participant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Participant user not found");
  }

  // Check if a 1-to-1 chat already exists between these two users
  const existingChat = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId } } },
        { participants: { some: { userId: participantId } } },
      ],
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  if (existingChat) {
    return existingChat;
  }

  // Create new 1-to-1 chat
  const chat = await prisma.chat.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId },
          { userId: participantId },
        ],
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
  });

  return chat;
};

// ─── Create group chat ─────────────────────────────────────────────────────────
const createGroupChat = async (userId: string, payload: ICreateGroupChat) => {
  const { name, description, avatar, participantIds } = payload;

  // Verify all participants exist
  const users = await prisma.user.findMany({
    where: { id: { in: participantIds } },
    select: { id: true },
  });

  if (users.length !== participantIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "One or more participant IDs are invalid");
  }

  // Ensure the creator is included as ADMIN
  const allParticipantIds = [...new Set([userId, ...participantIds])];

  const chat = await prisma.chat.create({
    data: {
      isGroup: true,
      name,
      description: description || null,
      avatar: avatar || null,
      participants: {
        create: allParticipantIds.map((id) => ({
          userId: id,
          role: id === userId ? "ADMIN" : "MEMBER",
        })),
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });

  return chat;
};

// ─── Get all chats for a user ──────────────────────────────────────────────────
const getMyChats = async (userId: string) => {
  const chats = await prisma.chat.findMany({
    where: {
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return chats;
};

// ─── Get single chat by ID ────────────────────────────────────────────────────
const getChatById = async (userId: string, chatId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participants: {
        some: { userId },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              bio: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat not found or you are not a participant");
  }

  return chat;
};

// ─── Update group chat (admin only) ────────────────────────────────────────────
const updateGroupChat = async (
  userId: string,
  chatId: string,
  payload: IUpdateGroupChat
) => {
  // Verify chat exists and user is admin
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      isGroup: true,
      participants: {
        some: { userId, role: "ADMIN" },
      },
    },
  });

  if (!chat) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Chat not found or you don't have admin permission"
    );
  }

  const updated = await prisma.chat.update({
    where: { id: chatId },
    data: {
      ...(payload.name && { name: payload.name }),
      ...(payload.description !== undefined && { description: payload.description }),
      ...(payload.avatar !== undefined && { avatar: payload.avatar }),
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });

  return updated;
};

// ─── Add participants to group (admin only) ────────────────────────────────────
const addParticipants = async (
  userId: string,
  chatId: string,
  payload: IAddParticipants
) => {
  // Verify chat exists and user is admin
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      isGroup: true,
      participants: {
        some: { userId, role: "ADMIN" },
      },
    },
    include: {
      participants: { select: { userId: true } },
    },
  });

  if (!chat) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Chat not found or you don't have admin permission"
    );
  }

  // Filter out already-existing participants
  const existingIds = new Set(chat.participants.map((p) => p.userId));
  const newIds = payload.participantIds.filter((id) => !existingIds.has(id));

  if (newIds.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All users are already in this chat");
  }

  // Verify new users exist
  const users = await prisma.user.findMany({
    where: { id: { in: newIds } },
    select: { id: true },
  });

  if (users.length !== newIds.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, "One or more participant IDs are invalid");
  }

  // Add participants
  await prisma.chatParticipant.createMany({
    data: newIds.map((id) => ({
      userId: id,
      chatId,
      role: "MEMBER" as const,
    })),
  });

  // Return updated chat
  const updatedChat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              isOnline: true,
              lastSeen: true,
            },
          },
        },
      },
    },
  });

  return updatedChat;
};

// ─── Remove participant from group (admin only) ───────────────────────────────
const removeParticipant = async (
  userId: string,
  chatId: string,
  participantId: string
) => {
  // Verify chat exists and user is admin
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      isGroup: true,
      participants: {
        some: { userId, role: "ADMIN" },
      },
    },
  });

  if (!chat) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Chat not found or you don't have admin permission"
    );
  }

  // Cannot remove yourself (use leaveGroup instead)
  if (userId === participantId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Use the leave group endpoint to leave");
  }

  // Check if participant is in the chat
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId: participantId },
  });

  if (!participant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Participant not found in this chat");
  }

  await prisma.chatParticipant.delete({
    where: { id: participant.id },
  });

  return { message: "Participant removed successfully" };
};

// ─── Leave group chat ──────────────────────────────────────────────────────────
const leaveGroupChat = async (userId: string, chatId: string) => {
  const participant = await prisma.chatParticipant.findFirst({
    where: { chatId, userId },
  });

  if (!participant) {
    throw new ApiError(httpStatus.NOT_FOUND, "You are not a participant of this chat");
  }

  // Check if the chat is a group
  const chat = await prisma.chat.findUnique({
    where: { id: chatId },
    include: {
      participants: true,
    },
  });

  if (!chat || !chat.isGroup) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can only leave group chats");
  }

  // If user is admin and there are other members, assign admin to the next member
  if (participant.role === "ADMIN") {
    const otherMembers = chat.participants.filter((p) => p.userId !== userId);
    const nextAdmin = otherMembers[0];
    if (nextAdmin) {
      await prisma.chatParticipant.update({
        where: { id: nextAdmin.id },
        data: { role: "ADMIN" },
      });
    }
  }

  await prisma.chatParticipant.delete({
    where: { id: participant.id },
  });

  // If no participants left, delete the chat
  const remaining = await prisma.chatParticipant.count({
    where: { chatId },
  });

  if (remaining === 0) {
    await prisma.message.deleteMany({ where: { chatId } });
    await prisma.chat.delete({ where: { id: chatId } });
  }

  return { message: "You have left the group" };
};

// ─── Delete chat (admin for groups, any participant for 1-to-1) ────────────────
const deleteChat = async (userId: string, chatId: string) => {
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      participants: {
        some: { userId },
      },
    },
    include: { participants: true },
  });

  if (!chat) {
    throw new ApiError(httpStatus.NOT_FOUND, "Chat not found");
  }

  // For group chats, only admin can delete
  if (chat.isGroup) {
    const isAdmin = chat.participants.some(
      (p) => p.userId === userId && p.role === "ADMIN"
    );
    if (!isAdmin) {
      throw new ApiError(httpStatus.FORBIDDEN, "Only group admin can delete the chat");
    }
  }

  // Delete related data in order
  await prisma.message.deleteMany({ where: { chatId } });
  await prisma.chatParticipant.deleteMany({ where: { chatId } });
  await prisma.chat.delete({ where: { id: chatId } });

  return { message: "Chat deleted successfully" };
};

export const ChatService = {
  createOneToOneChat,
  createGroupChat,
  getMyChats,
  getChatById,
  updateGroupChat,
  addParticipants,
  removeParticipant,
  leaveGroupChat,
  deleteChat,
};
