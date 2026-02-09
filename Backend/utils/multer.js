import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(), // ✅ required for Drive upload
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB (adjust as needed)
  },
});
