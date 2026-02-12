import { createNote } from "../controllers/note.controller.js";
import { updateNote } from "../controllers/note.controller.js";
import express from 'express';
import { authVerify } from "../middlewares/verify.middleware.js";
import { renameNote } from "../controllers/note.controller.js";

const noteRouter = express.Router();

noteRouter.route("/create-note").post(authVerify,createNote);
noteRouter.route("/update-note/:id").patch(authVerify,updateNote);
noteRouter.route("/rename-note/:id").put(authVerify,renameNote)

export default noteRouter;