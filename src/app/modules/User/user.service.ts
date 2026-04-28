import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import ApiError from "../../../errors/apiError";

const getAllUsers = async (userId: string, searchTerm?: string) => {
  console.log(searchTerm, "searchTerm from get all users");

  const whereCondition: any = {
    id: { not: userId },
  };

  console.log(whereCondition, "whereCondition from get all users");

  if (searchTerm) {
    whereCondition.OR = [
      { name: { contains: searchTerm, mode: "insensitive" } },
      { email: { contains: searchTerm, mode: "insensitive" } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return users;


};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

export const UserService = {
  getAllUsers,
  getUserById,
};
