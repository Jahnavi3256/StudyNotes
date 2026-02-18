// backend/collab.server.js
import { Server } from '@hocuspocus/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const server = new Server({
  port: 1234,

  async onAuthenticate({ token, documentName }) {
    // Allow all for now — add JWT validation here later
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

      document.share.set('seeded', true);

    } catch (err) {
      console.error('onLoadDocument error:', err);
    }
  },

  async onConnect({ documentName }) {
    console.log(`✅ Client connected to room: ${documentName}`);
  },

  async onDisconnect({ documentName }) {
    console.log(`❌ Client disconnected from room: ${documentName}`);
  },
});

server.listen();
console.log('🚀 Hocuspocus collab server running on ws://localhost:1234');