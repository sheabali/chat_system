import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ChatService } from "./chat.service";

const createOneToOneChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ChatService.createOneToOneChat(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Chat created successfully",
    data: result,
  });
});

const createGroupChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ChatService.createGroupChat(userId as string, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Group chat created successfully",
    data: result,
  });
});

const getMyChats = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await ChatService.getMyChats(userId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chats retrieved successfully",
    data: result,
  });
});

const getChatById = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await ChatService.getChatById(userId as string, chatId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat retrieved successfully",
    data: result,
  });
});

const updateGroupChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await ChatService.updateGroupChat(
    userId as string,
    chatId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Group chat updated successfully",
    data: result,
  });
});

const addParticipants = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await ChatService.addParticipants(
    userId as string,
    chatId as string,
    req.body
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participants added successfully",
    data: result,
  });
});

const removeParticipant = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId, participantId } = req.params;
  const result = await ChatService.removeParticipant(
    userId as string,
    chatId as string,
    participantId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Participant removed successfully",
    data: result,
  });
});

const leaveGroupChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await ChatService.leaveGroupChat(
    userId as string,
    chatId as string
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Left group successfully",
    data: result,
  });
});

const deleteChat = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const { chatId } = req.params;
  const result = await ChatService.deleteChat(userId as string, chatId as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat deleted successfully",
    data: result,
  });
});

export const ChatController = {
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
