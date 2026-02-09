import {express} from "express";
import { upload } from "../utils/multer";
import { uploadDocument } from "../controllers/document.controller";
import { authVerify } from "../middlewares/verify.middleware";

const documentRouter = express.Router();

documentRouter.Router("/uplaod-document").post(authVerify,upload.single('file'),uploadDocument);

export default documentRouter;