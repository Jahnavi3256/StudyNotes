import 'dotenv/config';
import {PrismaClient} from '@prisma/client';


const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} = process.env;

async function uploadFileToNotebookFolder(accessToken, notebookFolderId, file ) {
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

    // 1. Get notebook folder_id (ownership enforced)
    const notebook = await prisma.notebook.findFirst({
      where: {
        id: Number(notebookId),
        owner_id: userId,
      },
      select: {
        folder_id: true,
      },
    });

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
