import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { LiveLocationService } from "./liveLocation.service";

const updateLocation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const result = await LiveLocationService.updateLocation(userId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Location updated successfully",
    data: result,
  });
});

const getChatLocations = catchAsync(async (req: Request, res: Response) => {
  const { chatId } = req.params as any;
  const result = await LiveLocationService.getChatLocations(chatId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Chat locations retrieved successfully",
    data: result,
  });
});

export const LiveLocationController = {
  updateLocation,
  getChatLocations,
};
