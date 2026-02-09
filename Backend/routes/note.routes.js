import { createNote } from "../controllers/note.controller";
import { updateNote } from "../controllers/note.controller";
import {express} from 'express';
import { authVerify } from "../middlewares/verify.middleware";

const noteRouter = express.Router();

noteRouter.route("/create-note").post(authVerify,createNote);
noteRouter.route("/update-note").patch(authVerify,updateNote);

export default noteRouter;