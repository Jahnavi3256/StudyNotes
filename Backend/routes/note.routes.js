import { createNote } from "../controllers/note.controller.js";
import { updateNote } from "../controllers/note.controller.js";
import express from 'express';
import { authVerify } from "../middlewares/verify.middleware.js";

const noteRouter = express.Router();

noteRouter.route("/create-note").post(authVerify,createNote);
noteRouter.route("/update-note").patch(authVerify,updateNote);

export default noteRouter;