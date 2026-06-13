import multer from 'multer';
import { AppError } from '../errors.js';

export function createUpload(config) {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: config.maxUploadBytes, files: 1 },
    fileFilter(req, file, cb) {
      if (file.mimetype?.startsWith('image/')) cb(null, true);
      else cb(new AppError(400, 'BAD_REQUEST', 'The "chart" field must be an image.'));
    },
  });
  return upload.single('chart');
}
