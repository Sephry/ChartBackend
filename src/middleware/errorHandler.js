import multer from 'multer';
import { AppError } from '../errors.js';

// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: { code: 'IMAGE_TOO_LARGE', message: 'That image is too large.' } });
    }
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: err.message } });
  }
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
  }
  if (process.env.NODE_ENV !== 'test') {
    console.error('[errorHandler]', err);
  }
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Something went wrong.' } });
}
