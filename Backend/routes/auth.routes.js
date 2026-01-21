import express from "express";

const authRouter = express.Router();
import { googleAuth, googleCallback, getMe } from "../controllers/auth.controller.js";

authRouter.route("/google").get(googleAuth);
authRouter.route("/google/callback").get(googleCallback);
authRouter.route("/me").get(getMe);

export default authRouter;