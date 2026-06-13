import { Router } from 'express';
import { createUpload } from '../middleware/upload.js';
import { createAppCheck } from '../middleware/appCheck.js';
import { createAnalyzeController } from '../controllers/analyze.controller.js';

export function createRoutes(config, aiService) {
  const router = Router();

  router.get('/health', (req, res) => {
    res.json({ status: 'ok', provider: aiService.providerName, appCheckEnforced: config.appCheckEnforced });
  });

  router.post(
    '/api/v1/analyze',
    createAppCheck(config),
    createUpload(config),
    createAnalyzeController(aiService),
  );

  return router;
}
