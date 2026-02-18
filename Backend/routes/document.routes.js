import express from "express";
import { upload } from "../utils/multer.js";
import { uploadDocument } from "../controllers/document.controller.js";
import { authVerify } from "../middlewares/verify.middleware.js";
import { uploadDocumentToCloudinary, uploadNoteImage, uploadNoteAudio } from "../controllers/document.controller.js";

const documentRouter = express.Router();

/* documentRouter.route("/uplaod-document").post(authVerify,upload.single('file'),uploadDocument); */
documentRouter.route("/upload-doc").post(authVerify, upload.single('file'), uploadDocumentToCloudinary);
documentRouter.route("/upload-note-image").post(authVerify, upload.single('image'), uploadNoteImage);
documentRouter.route("/upload-note-audio").post(authVerify, upload.single('audio'), uploadNoteAudio);

export default documentRouter;