import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import ApiError from "../../../errors/apiError";
import { IUpdateLocation } from "./liveLocation.interface";

const updateLocation = async (userId: string, payload: IUpdateLocation) => {
  // Update or create live location for the user
  const location = await prisma.liveLocation.upsert({
    where: { id: userId }, // This assumes one live location entry per user
    // Wait, the schema has id: String @id @default(auto()) @map("_id") @db.ObjectId
    // It doesn't have a unique constraint on userId.
    // Let's check the schema again.
    create: {
      userId,
      chatId: payload.chatId || null,
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
    update: {
      chatId: payload.chatId || null,
      latitude: payload.latitude,
      longitude: payload.longitude,
    },
  });

  // Emit to chat room if chatId is provided
  if (payload.chatId && (global as any).io) {
    (global as any).io.to(payload.chatId).emit("locationUpdate", {
      userId,
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
  }

  return location;
};

// Re-checking schema: LiveLocation doesn't have a unique constraint on userId.
// I should probably use findFirst and then update or create.
const updateLocationFixed = async (userId: string, payload: IUpdateLocation) => {
  let location = await prisma.liveLocation.findFirst({
    where: { userId }
  });

  if (location) {
    location = await prisma.liveLocation.update({
      where: { id: location.id },
      data: {
        chatId: payload.chatId || null,
        latitude: payload.latitude,
        longitude: payload.longitude,
      }
    });
  } else {
    location = await prisma.liveLocation.create({
      data: {
        userId,
        chatId: payload.chatId || null,
        latitude: payload.latitude,
        longitude: payload.longitude,
      }
    });
  }

  // Emit real-time update
  if (payload.chatId && (global as any).io) {
    (global as any).io.to(payload.chatId).emit("locationUpdate", {
      userId,
      chatId: payload.chatId,
      latitude: payload.latitude,
      longitude: payload.longitude,
    });
  }

  return location;
};

const getChatLocations = async (chatId: string) => {
  const locations = await prisma.liveLocation.findMany({
    where: { chatId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        }
      }
    }
  });

  return locations;
};

export const LiveLocationService = {
  updateLocation: updateLocationFixed,
  getChatLocations,
};
