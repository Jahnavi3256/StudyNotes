import express from "express";
import { upload } from "../utils/multer.js";
import { uploadDocument } from "../controllers/document.controller.js";
import { authVerify } from "../middlewares/verify.middleware.js";
import { uploadDocumentToCloudinary } from "../controllers/document.controller.js";

const documentRouter = express.Router();

/* documentRouter.route("/uplaod-document").post(authVerify,upload.single('file'),uploadDocument); */
documentRouter.route("/upload-doc").post(authVerify,upload.single('file'),uploadDocumentToCloudinary);

export default documentRouter;