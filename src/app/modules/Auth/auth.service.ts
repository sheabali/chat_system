import httpStatus from "http-status";
import prisma from "../../../lib/prisma";
import ApiError from "../../../errors/apiError";
import config from "../../../config";
import { jwtHelpers } from "../../../utils/jwtHelpers";
import { hashPassword, comparePassword } from "../../../utils/passwordHelper";
import { ILoginUser, IRegisterUser } from "./auth.interface";

const register = async (payload: IRegisterUser) => {

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(httpStatus.CONFLICT, "User already exists with this email");
  }

  // Hash password
  const hashedPassword = await hashPassword(payload.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
      avatar: payload.avatar || "",
      bio: payload.bio || "",
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      isOnline: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = jwtHelpers.generateToken(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    config.jwt.expires_in as any
  );

  return {
    user,
    token,
  };
};

const login = async (payload: ILoginUser) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found with this email");
  }

  // Compare password
  const isPasswordValid = await comparePassword(payload.password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid password");
  }

  // Update online status
  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true, lastSeen: new Date() },
  });

  // Generate JWT token
  const token = jwtHelpers.generateToken(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    config.jwt.expires_in as any
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      bio: user.bio,
      isOnline: true,
    },
    token,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
};

const changePassword = async (
  userId: string,
  payload: { oldPassword: string; newPassword: string }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  // Compare old password
  const isPasswordValid = await comparePassword(payload.oldPassword, user.password);

  if (!isPasswordValid) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old password is incorrect");
  }

  // Hash new password
  const hashedPassword = await hashPassword(payload.newPassword);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { message: "Password changed successfully" };
};

const logout = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: false, lastSeen: new Date() },
  });

  return { message: "Logged out successfully" };
};

export const AuthService = {
  register,
  login,
  getMe,
  changePassword,
  logout,
};
