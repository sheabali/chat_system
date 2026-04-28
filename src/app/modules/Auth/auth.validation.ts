import { z } from "zod";

const register = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Name is required" }),

    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(6, { message: "Password must be at least 6 characters" }),

    avatar: z
      .string()
      .optional(),

    bio: z
      .string()
      .optional(),
  }),
});

const login = z.object({
  body: z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Please provide a valid email address"),

    password: z
      .string()
      .min(1, { message: "Password is required" }),
  }),
});

const changePassword = z.object({
  body: z.object({
    oldPassword: z
      .string()
      .min(1, { message: "Old password is required" }),

    newPassword: z
      .string()
      .min(1, { message: "New password is required" })
      .min(6, { message: "New password must be at least 6 characters" }),
  }),
});

export const AuthValidation = {
  register,
  login,
  changePassword,
};