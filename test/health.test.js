import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const config = {
  aiProvider: 'mock', anthropicApiKey: '', anthropicModel: 'claude-opus-4-8', anthropicMaxTokens: 16000,
  appCheckEnforced: false, corsOrigins: ['*'], maxUploadBytes: 5 * 1024 * 1024,
  rateLimit: { windowMs: 60000, max: 1000 },
};

describe('GET /health', () => {
  it('reports ok + provider + appCheckEnforced', async () => {
    const res = await request(createApp(config)).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok', provider: 'mock', appCheckEnforced: false });
  });
});
