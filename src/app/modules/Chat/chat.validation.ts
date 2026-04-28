import { z } from "zod";

const createOneToOneChat = z.object({
  body: z.object({
    participantId: z
      .string()
      .min(1, { message: "Participant ID is required" }),
  }),
});

const createGroupChat = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, { message: "Group name is required" })
      .max(100, { message: "Group name must be at most 100 characters" }),

    description: z
      .string()
      .max(500, { message: "Description must be at most 500 characters" })
      .optional(),

    avatar: z
      .string()
      .optional(),

    participantIds: z
      .array(z.string().min(1))
      .min(1, { message: "At least one participant is required" }),
  }),
});

const updateGroupChat = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
  }),
  body: z.object({
    name: z
      .string()
      .min(1)
      .max(100)
      .optional(),

    description: z
      .string()
      .max(500)
      .optional(),

    avatar: z
      .string()
      .optional(),
  }),
});

const addParticipants = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
  }),
  body: z.object({
    participantIds: z
      .array(z.string().min(1))
      .min(1, { message: "At least one participant ID is required" }),
  }),
});

const removeParticipant = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
    participantId: z.string().min(1, { message: "Participant ID is required" }),
  }),
});

const chatIdParam = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
  }),
});

export const ChatValidation = {
  createOneToOneChat,
  createGroupChat,
  updateGroupChat,
  addParticipants,
  removeParticipant,
  chatIdParam,
};
