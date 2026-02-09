import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import { Pool } from 'pg';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import cors from 'cors';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import {PrismaClient} from '@prisma/client';

const app = express();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

import authRouter from './routes/auth.routes.js';
import notebookRouter from './routes/notebook.routes.js';
import documentRouter from "./routes/document.routes.js";
import noteRouter from './routes/note.routes.js';

app.use("/auth",authRouter);
app.use("/",notebookRouter);
app.use("/",documentRouter);
app.use("/",noteRouter);

/* -------------------- START -------------------- */
app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});


////////////////////////////////////////////////////////////



