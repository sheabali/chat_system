import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { MessageService } from "./message.service";

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await MessageService.sendMessage(
    userId as string,
    chatId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Message sent successfully",
    data: result,
  });
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 50;

  const result = await MessageService.getMessages(
    userId as string,
    chatId as string,
    page,
    limit
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Messages retrieved successfully",
    meta: result.meta,
    data: result.messages,
  });
});

const updateMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId, messageId } = req.params;
  const result = await MessageService.updateMessage(
    userId as string,
    chatId as string,
    messageId as string,
    req.body.content
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message updated successfully",
    data: result,
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId, messageId } = req.params;
  const result = await MessageService.deleteMessage(
    userId as string,
    chatId as string,
    messageId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Message deleted successfully",
    data: result,
  });
});

export const MessageController = {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
};
