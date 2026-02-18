import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../utils/cloudinary.js';
import streamifier from 'streamifier';


const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

async function userHasNotebookAccess(prisma, userId, notebookId) {
  const notebook = await prisma.notebook.findUnique({
    where: { id: notebookId },
    select: { id: true, owner_id: true, folder_id: true },
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

async function uploadFileToNotebookFolder(accessToken, notebookFolderId, file) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });

  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.create({
    resource: {
      name: file.originalname,
      parents: [notebookFolderId],
    },
    media: {
      mimeType: file.mimetype,
      body: Buffer.from(file.buffer),
    },
    fields: 'id, webViewLink',
  });

  return {
    fileId: res.data.id,
    fileUrl: res.data.webViewLink,
  };
}


export const uploadDocument = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const { notebookId } = req.body; // use parameter here 
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "File is required" });
    }

    // 1. Get notebook folder_id (owner or member)
    const notebookIdNum = Number(notebookId);
    if (Number.isNaN(notebookIdNum)) {
      return res.status(400).json({ message: "Invalid notebookId" });
    }

    const notebook = await userHasNotebookAccess(prisma, userId, notebookIdNum);

    if (!notebook) {
      return res.status(404).json({ message: "Notebook not found" });
    }

    // 2. Get user's refresh token
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        refresh_token: true,
      },
    });

    // 3. Refresh Google access token
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        refresh_token: user.refresh_token,
        grant_type: 'refresh_token',
      }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const accessToken = tokenRes.data.access_token;

    // 4. Upload file to Drive
    const { fileId, fileUrl } = await uploadFileToNotebookFolder(
      accessToken,
      notebook.folder_id,
      file
    );

    // 5. Save document in DB
    const document = await prisma.document.create({
      data: {
        filename: file.originalname,
        file_url: fileUrl,
        file_size: BigInt(file.size),
        mime_type: file.mimetype,
        uploader_id: userId,
      },
      select: {
        id: true,
        filename: true,
        file_url: true,
        mime_type: true,
        uploaded_at: true,
      },
    });

    res.status(201).json({
      document,
      drive: {
        fileId,
        fileUrl,
      },
    });

  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ message: "Failed to upload document" });
  }
};

export const uploadNoteImage = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    // Validate it's an image
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ message: 'File must be an image' });
    }

    // Upload image buffer to Cloudinary
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'notebook-images', // Folder for note images
            resource_type: 'image',
            type: 'upload',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const uploadResult = await streamUpload();

    return res.status(200).json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error) {
    console.error('Upload note image error:', error);
    return res.status(500).json({ message: 'Failed to upload image' });
  }
};


export const uploadDocumentToCloudinary = async (req, res) => {
  const prisma = new PrismaClient();

  try {
    const userId = req.user;              // set by auth middleware
    const { notebookId } = req.body;      // target notebook
    const file = req.file;                // from multer (memoryStorage)

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    if (!notebookId) {
      return res.status(400).json({ message: 'notebookId is required' });
    }

    const notebookIdNum = Number(notebookId);
    if (Number.isNaN(notebookIdNum)) {
      return res.status(400).json({ message: 'Invalid notebookId' });
    }

    // 1. Verify notebook exists and user has access (owner or member)
    const notebook = await userHasNotebookAccess(prisma, userId, notebookIdNum);

    if (!notebook) {
      return res.status(404).json({ message: 'Notebook not found' });
    }

    // 2. Upload file buffer to Cloudinary (using upload_stream + streamifier)
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: `notebooks/${notebookIdNum}`, // optional folder structure
            resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto',
            type: "upload",
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const uploadResult = await streamUpload();

    // 3. Store document info in DB (Document model)
    const document = await prisma.document.create({
      data: {
        filename: file.originalname,                  // String
        file_url: uploadResult.secure_url,           // String
        file_size: BigInt(file.size),                // BigInt
        mime_type: file.mimetype,                    // String
        page_count: null,                            // Int? (unknown at upload)
        uploader_id: userId,                         // Int
        notebook_id: notebookIdNum,                  // Int
      },
      select: {
        id: true,
        filename: true,
        file_url: true,
        mime_type: true,
        page_count: true,
        uploaded_at: true,
        uploader_id: true,
        notebook_id: true,
      },
    });

    // update the value of updated_at in notebook table (notebookIdNum)


    // 4. Respond with DB record + Cloudinary metadata
    return res.status(201).json({
      document,
      cloudinary: {
        public_id: uploadResult.public_id,
        url: uploadResult.secure_url,
        resource_type: uploadResult.resource_type,
      },
    });
  } catch (error) {
    console.error('Upload document to Cloudinary error:', error);
    return res.status(500).json({ message: 'Failed to upload document' });
  }
};

export const uploadNoteAudio = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'Audio file is required' });
    }

    // Validate it's an audio file
    if (!file.mimetype.startsWith('audio/')) {
      return res.status(400).json({ message: 'File must be an audio file' });
    }

    // Upload audio buffer to Cloudinary (resource_type: 'video' handles audio too)
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'notebook-audio', // Folder for note audio
            resource_type: 'video',
            type: 'upload',
          },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const uploadResult = await streamUpload();

    return res.status(200).json({
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      duration: uploadResult.duration,
    });
  } catch (error) {
    console.error('Upload note audio error:', error);
    return res.status(500).json({ message: 'Failed to upload audio' });
  }
};

