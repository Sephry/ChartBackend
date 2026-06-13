import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createAiService } from './services/aiService.js';
import { createRoutes } from './routes/analyze.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp(config) {
  const app = express();
  app.disable('x-powered-by');

  // Request logging first, so every request (incl. later-rejected ones) is logged.
  // Silent during tests to keep the suite output clean.
  app.use(morgan(config.logFormat, { skip: () => process.env.NODE_ENV === 'test' }));

  app.use(helmet());

  const origin = config.corsOrigins.includes('*') ? true : config.corsOrigins;
  app.use(cors({ origin }));

  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
  }));

  const aiService = createAiService(config);
  app.use(createRoutes(config, aiService));
  app.use(errorHandler);
  return app;
}
