import express from "express";
import { upload } from "../utils/multer.js";
import { uploadDocument } from "../controllers/document.controller.js";
import { authVerify } from "../middlewares/verify.middleware.js";

const documentRouter = express.Router();

documentRouter.route("/uplaod-document").post(authVerify,upload.single('file'),uploadDocument);

export default documentRouter;