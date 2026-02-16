/* app.post('/new-notebook',authVerify, async (req, res) => { */
import express from "express";
import {authVerify} from "../middlewares/verify.middleware.js";
import {newNotebook} from "../controllers/notebook.controller.js";
import { getAllNotebooks } from "../controllers/notebook.controller.js";
import { getRecentNotebooks } from "../controllers/notebook.controller.js";
import { getNotebookById } from "../controllers/notebook.controller.js";
import { newNotebookWithCode } from "../controllers/notebook.controller.js";
import { joinNotebookByCode } from "../controllers/notebook.controller.js";

const notebookRouter = express.Router();

notebookRouter.route("/new-notebook").post(authVerify,newNotebook);
notebookRouter.route("/new-notebook-with-code").post(authVerify,newNotebookWithCode);
notebookRouter.route("/all-notebooks").get(authVerify,getAllNotebooks);
notebookRouter.route("/recent-notebooks").get(authVerify,getRecentNotebooks);
notebookRouter.route("/notebook/:id").get(authVerify,getNotebookById);
notebookRouter.route("/join-notebook").post(authVerify, joinNotebookByCode);

export default notebookRouter;

