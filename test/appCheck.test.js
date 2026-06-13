import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

function makeConfig(overrides = {}) {
  return {
    aiProvider: 'mock', anthropicApiKey: '', anthropicModel: 'claude-opus-4-8', anthropicMaxTokens: 16000,
    appCheckEnforced: false, corsOrigins: ['*'], maxUploadBytes: 5 * 1024 * 1024,
    rateLimit: { windowMs: 60000, max: 1000 }, ...overrides,
  };
}

const img = Buffer.from('fake-image-bytes');

describe('App Check gate', () => {
  it('passes through when enforcement is off', async () => {
    const res = await request(createApp(makeConfig({ appCheckEnforced: false })))
      .post('/api/v1/analyze')
      .field('meta', '{}')
      .attach('chart', img, { filename: 'c.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(200);
  });

  it('401 when enforced and no token is provided', async () => {
    const res = await request(createApp(makeConfig({ appCheckEnforced: true })))
      .post('/api/v1/analyze')
      .field('meta', '{}')
      .attach('chart', img, { filename: 'c.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('APP_CHECK_FAILED');
  });
});
