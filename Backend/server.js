import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { Hocuspocus } from '@hocuspocus/server';
import { PrismaClient } from '@prisma/client';
import { WebSocketServer } from 'ws';

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();

/* -------------------- MIDDLEWARE -------------------- */
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

/* -------------------- ROUTES -------------------- */
import authRouter from './routes/auth.routes.js';
import notebookRouter from './routes/notebook.routes.js';
import documentRouter from './routes/document.routes.js';
import noteRouter from './routes/note.routes.js';

app.use('/auth', authRouter);
app.use('/', notebookRouter);
app.use('/', documentRouter);
app.use('/', noteRouter);

/* -------------------- SOCKET.IO -------------------- */
const io = new SocketIOServer(httpServer, {
  path: '/socket.io',
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
  transports: ['polling', 'websocket'],
});

// voiceRooms: Map<roomId, Map<socketId, { userId, userName }>>
const voiceRooms = new Map();

// Helper: broadcast the current voice participant list for a room
function broadcastVoiceParticipants(roomId) {
  const room = voiceRooms.get(roomId);
  const participants = room
    ? Array.from(room.entries()).map(([socketId, info]) => ({ socketId, ...info }))
    : [];
  io.to(roomId).emit('voice-participants', participants);
}

io.on('connection', (socket) => {
  console.log('Socket.io user connected:', socket.id);

  // Track which notebook room this socket belongs to for cleanup
  let currentRoomId = null;

  socket.on('join-room', (roomId, userId) => {
    currentRoomId = roomId;
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId, socket.id);
    console.log(`User ${userId} joined room ${roomId}`);

    // Send current voice participants to the newly joined user
    broadcastVoiceParticipants(roomId);
  });

  // User clicks "Join Voice Channel"
  socket.on('join-voice', ({ roomId, userId, userName }) => {
    if (!voiceRooms.has(roomId)) voiceRooms.set(roomId, new Map());
    const room = voiceRooms.get(roomId);

    // Tell every EXISTING voice participant about the newcomer so they initiate WebRTC
    room.forEach((info, existingSocketId) => {
      io.to(existingSocketId).emit('voice-user-joined', {
        socketId: socket.id,
        userId,
        userName,
      });
    });

    room.set(socket.id, { userId, userName });
    console.log(`User ${userName} (${userId}) joined voice in room ${roomId}`);
    broadcastVoiceParticipants(roomId);
  });

  // User clicks "Leave" / closes panel
  socket.on('leave-voice', ({ roomId }) => {
    if (voiceRooms.has(roomId)) {
      voiceRooms.get(roomId).delete(socket.id);
      if (voiceRooms.get(roomId).size === 0) voiceRooms.delete(roomId);
    }
    broadcastVoiceParticipants(roomId);
  });

  socket.on('signal', (data) => {
    io.to(data.target).emit('signal', {
      signal: data.signal,
      callerId: socket.id,
      userId: data.userId,
    });
  });

  socket.on('update-checklist', (roomId, checklist) => {
    socket.to(roomId).emit('checklist-updated', checklist);
  });

  socket.on('disconnect', () => {
    console.log('Socket.io user disconnected:', socket.id);

    // Clean up voice room
    if (currentRoomId && voiceRooms.has(currentRoomId)) {
      voiceRooms.get(currentRoomId).delete(socket.id);
      if (voiceRooms.get(currentRoomId).size === 0) voiceRooms.delete(currentRoomId);
      broadcastVoiceParticipants(currentRoomId);
    }

    // Notify only the room this socket was in (not all sockets)
    if (currentRoomId) {
      socket.to(currentRoomId).emit('user-disconnected', socket.id);
    }
  });
});

/* -------------------- HOCUSPOCUS -------------------- */
const hocuspocus = new Hocuspocus({
  async onAuthenticate() {
    return true;
  },

  async onLoadDocument({ documentName, document }) {
    try {
      const noteId = parseInt(documentName.replace('note-', ''));
      if (isNaN(noteId)) return;

      const note = await prisma.note.findUnique({
        where: { id: noteId },
        select: { content: true },
      });

      if (!note?.content) return;

      const yContent = document.getXmlFragment('default');
      if (yContent.length > 0) return;

      // Mark as seeded — actual content seeding is done on the frontend
      document.share.set('seeded', true);
    } catch (err) {
      console.error('Hocuspocus onLoadDocument error:', err);
    }
  },

  async onConnect({ documentName }) {
    console.log(`✅ Hocuspocus: client connected to room: ${documentName}`);
  },

  async onDisconnect({ documentName }) {
    console.log(`❌ Hocuspocus: client disconnected from room: ${documentName}`);
  },
});

// Dedicated WebSocket server for Hocuspocus — no path conflict with Socket.io
const collabWss = new WebSocketServer({ noServer: true });
collabWss.on('connection', (websocket, request) => {
  hocuspocus.handleConnection(websocket, request);
});

/* -------------------- UPGRADE ROUTING -------------------- */
// Manually split upgrade events: /collab → Hocuspocus, everything else → Socket.io
httpServer.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];

  if (pathname === '/collab') {
    collabWss.handleUpgrade(request, socket, head, (ws) => {
      collabWss.emit('connection', ws, request);
    });
  }
  // Socket.io handles its own /socket.io upgrades internally — do nothing else here
});

/* -------------------- START -------------------- */
httpServer.listen(4000, () => {
  console.log('🚀 Server running on http://localhost:4000');
  console.log('🔗 Hocuspocus WebSocket on ws://localhost:4000/collab');
  console.log('🔗 Socket.io on http://localhost:4000/socket.io');
});
