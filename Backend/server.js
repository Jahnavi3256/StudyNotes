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
import { PrismaClient } from '@prisma/client';

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  }
});

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

app.use("/auth", authRouter);
app.use("/", notebookRouter);
app.use("/", documentRouter);
app.use("/", noteRouter);

/* -------------------- SOCKET.IO SIGNALING -------------------- */
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId, socket.id);
    console.log(`User ${userId} joined room ${roomId}`);
  });

  socket.on('signal', (data) => {
    io.to(data.target).emit('signal', {
      signal: data.signal,
      callerId: socket.id,
      userId: data.userId // Metadata about who is calling
    });
  });

  // Checklist Events
  socket.on('update-checklist', (roomId, checklist) => {
    socket.to(roomId).emit('checklist-updated', checklist);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    io.emit('user-disconnected', socket.id);
  });
});

/* -------------------- START -------------------- */
httpServer.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});


////////////////////////////////////////////////////////////



