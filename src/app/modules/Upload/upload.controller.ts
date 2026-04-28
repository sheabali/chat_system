import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";

const uploadFile = catchAsync(async (req: Request, res: Response) => {
  const file = req.file;
  
  if (!file) {
    return sendResponse(res, {
      statusCode: httpStatus.BAD_REQUEST,
      success: false,
      message: "No file uploaded",
      data: null,
    });
  }

  // Construct file URL
  const fileUrl = `/uploads/${file.filename}`;

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "File uploaded successfully",
    data: {
      url: fileUrl,
      mimetype: file.mimetype,
      size: file.size,
    },
  });
});

export const UploadController = {
  uploadFile,
};
