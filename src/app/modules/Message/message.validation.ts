import { z } from "zod";

const sendMessage = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
  }),
  body: z.object({
    content: z
      .string()
      .optional(),

    fileUrl: z
      .string()
      .optional(),

    type: z
      .enum(["TEXT", "IMAGE", "AUDIO", "VIDEO", "FILE"])
      .optional()
      .default("TEXT"),
  }).refine(
    (data) => data.content || data.fileUrl,
    { message: "Either content or fileUrl must be provided" }
  ),
});

const getMessages = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50)),
  }),
});

const messageIdParam = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
    messageId: z.string().min(1, { message: "Message ID is required" }),
  }),
});

const updateMessage = z.object({
  params: z.object({
    chatId: z.string().min(1, { message: "Chat ID is required" }),
    messageId: z.string().min(1, { message: "Message ID is required" }),
  }),
  body: z.object({
    content: z.string().min(1, { message: "Content is required" }),
  }),
});

export const MessageValidation = {
  sendMessage,
  getMessages,
  messageIdParam,
  updateMessage,
};
