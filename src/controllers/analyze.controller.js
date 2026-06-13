import { AppError } from '../errors.js';

export function createAnalyzeController(aiService) {
  return async function analyze(req, res, next) {
    try {
      if (!req.file?.buffer?.length) {
        throw new AppError(400, 'BAD_REQUEST', 'A "chart" image file is required.');
      }

      let meta = {};
      if (req.body?.meta) {
        try {
          meta = JSON.parse(req.body.meta);
        } catch {
          throw new AppError(400, 'BAD_REQUEST', 'The "meta" field must be valid JSON.');
        }
      }

      const result = await aiService.analyze({
        imageBuffer: req.file.buffer,
        mimeType: req.file.mimetype,
        meta,
      });
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
