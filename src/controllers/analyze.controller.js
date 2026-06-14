import { AppError } from '../errors.js';

// Known string fields accepted on the `meta` part. `symbol` is the asset the chart
// is for (sent by the iOS app as the "Asset name"). Values are trimmed, length-capped,
// and dropped when empty so only meaningful input reaches the prompt.
const META_FIELDS = ['symbol', 'timeframe', 'note', 'depth'];

function sanitizeMeta(raw) {
  if (!raw || typeof raw !== 'object') return {};
  const meta = {};
  for (const key of META_FIELDS) {
    const value = raw[key];
    if (typeof value === 'string') {
      const trimmed = value.trim().slice(0, 120);
      if (trimmed) meta[key] = trimmed;
    }
  }
  return meta;
}

export function createAnalyzeController(aiService) {
  return async function analyze(req, res, next) {
    try {
      if (!req.file?.buffer?.length) {
        throw new AppError(400, 'BAD_REQUEST', 'A "chart" image file is required.');
      }

      let meta = {};
      if (req.body?.meta) {
        let parsed;
        try {
          parsed = JSON.parse(req.body.meta);
        } catch {
          throw new AppError(400, 'BAD_REQUEST', 'The "meta" field must be valid JSON.');
        }
        meta = sanitizeMeta(parsed);
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
