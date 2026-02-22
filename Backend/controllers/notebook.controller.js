import 'dotenv/config';
import axios from 'axios';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

async function userHasNotebookAccess(prisma, userId, notebookId) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: {
      id: true,
      owner_id: true,
      title: true,
      colour: true,
      folder_id: true,
      created_at: true,
      updated_at: true,
    },
  });

  if (!notebook) return null;
  if (notebook.owner_id === userId) return notebook;

  const membership = await prisma.notebookMember.findUnique({
    where: {
      notebook_id_user_id: {
        notebook_id: notebookId,
        user_id: userId,
      },
    },
    select: { id: true },
  });

  if (!membership) return null;
  return notebook;
}

function generateNotebookCode(length = 8) {
  // 8 character code generated randomly 
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * chars.length);
    code += chars[idx];
  }
  return code;
}

// right now we are not using the folder uplaod to drive so comment folder creation logic so it becomes faster
async function createNotebookFolder(accessToken, parentFolderId, notebookTitle) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.create({
    resource: {
      name: notebookTitle,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  });

  const folderId = res.data.id;

  return {
    folderId,
    folderUrl: `https://drive.google.com/drive/folders/${folderId}`,
  };
}

export const newNotebook = async (req, res) => {

  const prisma = new PrismaClient();




  // get the data from body
  const { title, colour } = req.body;
  if (!title) {
    throw new Error("Notebook name is required");
  }

  // auth check will already add the user to the req obj 
  const userId = req.user;
  // get the user`s folder_id and reference token by quering the db
  const userRes = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      drive_folder_id: true,
      refresh_token: true,
    },
  })

  console.log("response of user query", userRes);
  const { drive_folder_id, refresh_token } = userRes;

  // 2. Get fresh access token
  const tokenRes = await axios.post(
    'https://oauth2.googleapis.com/token',
    new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token,
      grant_type: 'refresh_token',
    }).toString(),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  const accessToken = tokenRes.data.access_token;

  // call the function to create the notebook
  const { folderId, folderUrl } = await createNotebookFolder(
    accessToken,
    drive_folder_id,
    title
  );

  // insert the new notebook data in db
  try {
    const notebookRes = await prisma.notebook.create({
      data: {
        title: title,
        colour: colour || '#6366f1',
        owner_id: userId,
        folder_id: folderId,
      },
      select: {
        id: true,
        title: true,
        colour: true,
        folder_id: true,
        created_at: true,
      }
    });

    res.status(201).json({
      notebook: notebookRes,
      drive: {
        folderId,
        folderUrl,
      },
    });

  } catch (error) {
    console.log("error in creating notebook", error);
    res.status(401).json({
      message: error
    });
  }

};

export const getAllNotebooks = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;

    const notebooks = await prisma.notebook.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            notebookMembers: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        updated_at: 'desc',
      },
      select: {
        id: true,
        title: true,
        colour: true,
        folder_id: true,
        created_at: true,
        updated_at: true,
        owner_id: true,
        _count: {
          select: {
            note: true, // number of notes per notebook
            notebookMembers: true, // number of members
          },
        },
      },
    });

    const categorizedNotebooks = notebooks.map(n => {
      const isOwner = n.owner_id === userId;
      const memberCount = n._count.notebookMembers;

      // Personal if owner and no other members
      // Shared if not owner OR (owner and has members)
      const category = (isOwner && memberCount === 0) ? "Personal" : "Shared";

      return {
        id: n.id,
        title: n.title,
        colour: n.colour,
        folder_id: n.folder_id,
        created_at: n.created_at,
        updated_at: n.updated_at,
        note_count: n._count.note,
        isOwner,
        category,
      };
    });

    res.json({
      notebooks: categorizedNotebooks,
    });

  } catch (error) {
    console.error("Get notebooks error:", error);
    res.status(500).json({ message: "Failed to fetch notebooks" });
  }
};

export const getRecentNotebooks = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;

    const notebooks = await prisma.notebook.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            notebookMembers: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        updated_at: 'desc',
      },
      take: 6,
      select: {
        id: true,
        title: true,
        colour: true,
        folder_id: true,
        created_at: true,
        updated_at: true,
        owner_id: true,
        code: true,
      },
    });

    const shaped = notebooks.map(n => ({
      id: n.id,
      title: n.title,
      colour: n.colour,
      folder_id: n.folder_id,
      created_at: n.created_at,
      updated_at: n.updated_at,
      owner_id: n.owner_id,
      code: n.code,
      isOwner: n.owner_id === userId,
    }));

    res.json({ notebooks: shaped });
  } catch (error) {
    console.error("Get recent notebooks error:", error);
    res.status(500).json({ message: "Failed to fetch recent notebooks" });
  }
};

export const getRecentUserNotebooks = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;

    const notebooks = await prisma.notebook.findMany({
      where: {
        OR: [
          { owner_id: userId },
          {
            notebookMembers: {
              some: {
                user_id: userId,
              },
            },
          },
        ],
      },
      orderBy: {
        updated_at: "desc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        colour: true,
        folder_id: true,
        created_at: true,
        updated_at: true,
        owner_id: true,
        code: true,
      },
    });

    res.json({ notebooks });
  } catch (error) {
    console.error("Get recent user notebooks error:", error);
    res.status(500).json({ message: "Failed to fetch user notebooks" });
  }
};

export const getNotebookById = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const notebookId = parseInt(req.params.id);

    if (!notebookId || isNaN(notebookId)) {
      return res.status(400).json({ message: "Invalid notebook ID" });
    }

    // Verify notebook access (owner or member) and get notebook info
    const notebook = await userHasNotebookAccess(prisma, userId, notebookId);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // Fetch documents for this notebook
    const documents = await prisma.document.findMany({
      where: {
        notebook_id: notebookId,
      },
      select: {
        id: true,
        filename: true,
        file_url: true,
        mime_type: true,
        page_count: true,
        uploaded_at: true,
        uploader_id: true,
      },
      orderBy: {
        uploaded_at: 'desc',
      },
    });

    // Fetch notes for this notebook
    const notes = await prisma.note.findMany({
      where: {
        notebook_id: notebookId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
        updated_at: true,
      },
      orderBy: {
        updated_at: 'desc',
      },
    });

    function serializeBigInt(data) {
      return JSON.parse(
        JSON.stringify(data, (_, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )
      );
    }

    res.json({
      notebook,
      documents,
      notes,
    });

  } catch (error) {
    console.error("Get notebook by ID error:", error);
    res.status(500).json({ message: "Failed to fetch notebook" });
  }
};

export const newNotebookWithCode = async (req, res) => {
  const prisma = new PrismaClient();

  const { title, colour } = req.body;
  if (!title) {
    return res.status(400).json({ message: "Notebook name is required" });
  }

  const userId = req.user;

  try {
    const userRes = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        drive_folder_id: true,
        refresh_token: true,
      },
    });

    if (!userRes || !userRes.drive_folder_id || !userRes.refresh_token) {
      return res.status(400).json({ message: "User is not properly configured for Drive access" });
    }

    const { drive_folder_id, refresh_token } = userRes;

    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token,
        grant_type: 'refresh_token',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    const { folderId, folderUrl } = await createNotebookFolder(
      accessToken,
      drive_folder_id,
      title
    );

    let notebookRes;
    let attempts = 0;

    while (attempts < 5) {
      const code = generateNotebookCode();
      try {
        notebookRes = await prisma.notebook.create({
          data: {
            title,
            colour: colour || '#6366f1',
            owner_id: userId,
            folder_id: folderId,
            code,
          },
          select: {
            id: true,
            title: true,
            colour: true,
            folder_id: true,
            code: true,
            created_at: true,
            updated_at: true,
            owner_id: true,
          },
        });
        break;
      } catch (error) {
        if (error.code === 'P2002' && Array.isArray(error.meta?.target) && error.meta.target.includes('code')) {
          attempts += 1;
          continue;
        }
        throw error;
      }
    }

    if (!notebookRes) {
      return res.status(500).json({ message: "Failed to generate unique notebook code" });
    }

    res.status(201).json({
      notebook: notebookRes,
      drive: {
        folderId,
        folderUrl,
      },
    });
  } catch (error) {
    console.error("error in creating notebook with code", error);
    res.status(500).json({
      message: "Failed to create notebook",
    });
  }
};

export const joinNotebookByCode = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const { code } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: "Notebook code is required" });
    }

    const trimmedCode = code.trim();

    const notebook = await prisma.notebook.findFirst({
      where: {
        code: {
          equals: trimmedCode,
          mode: 'insensitive',   // case-insensitive match (works on PostgreSQL)
        },
      },
      select: {
        id: true,
        title: true,
        colour: true,
        folder_id: true,
        owner_id: true,
        code: true,
      },
    });

    if (!notebook) {
      return res.status(404).json({ message: "Invalid notebook code" });
    }

    await prisma.notebookMember.upsert({
      where: {
        notebook_id_user_id: {
          notebook_id: notebook.id,
          user_id: userId,
        },
      },
      update: {},
      create: {
        notebook_id: notebook.id,
        user_id: userId,
      },
    });

    return res.status(200).json({
      message: "Joined notebook successfully",
      notebook,
    });
  } catch (error) {
    console.error("Join notebook by code error:", error);
    return res.status(500).json({ message: "Failed to join notebook" });
  }
};
