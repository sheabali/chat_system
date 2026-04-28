import express from "express";
import auth from "../../middlewares/auth";
import { FileUploadHelper } from "../../../helpers/fileUploadHelper";
import { UploadController } from "./upload.controller";

const router = express.Router();

router.post(
  "/",
  auth(),
  FileUploadHelper.single("file"),
  UploadController.uploadFile
);

export const UploadRoutes = router;
