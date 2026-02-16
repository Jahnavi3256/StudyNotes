import 'dotenv/config';
import {PrismaClient} from '@prisma/client';

async function userHasNotebookAccess(prisma, userId, notebookId) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: { id: true, owner_id: true },
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

export const createNote = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const { notebookId } = req.body; // use parameters here
    const { title, content } = req.body;

    if (!notebookId) {
      return res.status(400).json({ message: "notebookId is required" });
    }

    if (!title) {
      return res.status(400).json({ message: "Note title is required" });
    }

    const notebookIdNum = Number(notebookId);
    if (Number.isNaN(notebookIdNum)) {
      return res.status(400).json({ message: "Invalid notebookId" });
    }

    // 1. Verify notebook access (owner or member)
    const notebook = await userHasNotebookAccess(prisma, userId, notebookIdNum);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // 2. Create note
    const note = await prisma.note.create({
      data: {
        title,
        content: content || {},
        notebook_id: notebookIdNum,
      },
      select: {
        id: true,
        title: true,
        content: true,
        created_at: true,
      },
    });

    res.status(201).json({ note });

  } catch (error) {
    console.error("Create note error:", error);
    res.status(500).json({ message: "Failed to create note" });
  }
};

function deepMerge(oldData, newData) {
  if (
    typeof oldData !== 'object' ||
    typeof newData !== 'object' ||
    Array.isArray(oldData) ||
    Array.isArray(newData)
  ) {
    return newData;
  }

  const result = { ...oldData };

  for (const key of Object.keys(newData)) {
    result[key] =
      key in oldData
        ? deepMerge(oldData[key], newData[key])
        : newData[key];
  }

  return result;
}


export const updateNote = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const { id } = req.params;
    const { title, content } = req.body;

    // 1. Get note + access check (owner or member)
    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
        notebooks: {
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
      },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // 2. Merge JSON content (partial update)
    let mergedContent = note.content;

    if (content) {
      mergedContent = deepMerge(note.content || {}, content);
    }

    // 3. Update note
    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        title: title ?? note.title,
        content: mergedContent,
        updated_at: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        updated_at: true,
      },
    });

    res.json({ note: updatedNote });

  } catch (error) {
    console.error("Update note error:", error);
    res.status(500).json({ message: "Failed to update note" });
  }
};




export const renameNote = async (req, res) => {

  const prisma = new PrismaClient();

  try {
    const userId = req.user;        // from auth middleware
    const { id } = req.params;      // /update-note/:id
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res
        .status(400)
        .json({ message: "Note title is required" });
    }

    // Check access (owner or member) and existence
    const note = await prisma.note.findFirst({
      where: {
        id: Number(id),
        notebooks: {
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
      },
      select: { id: true },
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Update only the title
    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: {
        title: title.trim(),
        updated_at: new Date(),
      },
      select: {
        id: true,
        title: true,
        updated_at: true,
      },
    });

    res.json({ note: updatedNote });
  } catch (error) {
    console.error("Rename note error:", error);
    res.status(500).json({ message: "Failed to rename note" });
  }
};