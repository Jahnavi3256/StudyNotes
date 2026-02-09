/* app.post('/new-notebook',authVerify, async (req, res) => { */
import express from "express";
import {authVerify} from "../middlewares/verify.middleware.js";
import {newNotebook} from "../controllers/notebook.controller.js";
import { getAllNotebooks } from "../controllers/notebook.controller.js";

const notebookRouter = express.Router();

notebookRouter.route("/new-notebook").post(authVerify,newNotebook);
notebookRouter.route("/all-notebooks").post(authVerify,getAllNotebooks);

export default notebookRouter;

