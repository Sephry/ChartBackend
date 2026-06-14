import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { analysisResultSchema } from '../src/schema/analysisResult.js';

function makeConfig(overrides = {}) {
  return {
    aiProvider: 'mock', anthropicApiKey: '', anthropicModel: 'claude-opus-4-8', anthropicMaxTokens: 16000,
    appCheckEnforced: false, corsOrigins: ['*'], maxUploadBytes: 5 * 1024 * 1024,
    rateLimit: { windowMs: 60000, max: 1000 }, ...overrides,
  };
}

const img = Buffer.from('fake-image-bytes');

describe('POST /api/v1/analyze', () => {
  it('returns a contract-valid AnalysisResult (mock provider, no key)', async () => {
    const res = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .field('meta', JSON.stringify({ symbol: 'EURUSD', timeframe: '1h', depth: 'standard' }))
      .attach('chart', img, { filename: 'chart.jpg', contentType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(() => analysisResultSchema.parse(res.body)).not.toThrow();
    expect(res.body.suggestion.disclaimer.toLowerCase()).toContain('not financial advice');
    expect(res.body.id).toBeTruthy();
    expect(res.body.createdAt).toBeTruthy();
    expect(res.body.symbol).toBe('EURUSD');
  });

  it('echoes a trimmed symbol and omits it when blank/absent', async () => {
    const withBlank = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .field('meta', JSON.stringify({ symbol: '   ' }))
      .attach('chart', img, { filename: 'chart.jpg', contentType: 'image/jpeg' });
    expect(withBlank.status).toBe(200);
    expect(withBlank.body.symbol).toBeUndefined();

    const absent = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .field('meta', '{}')
      .attach('chart', img, { filename: 'chart.jpg', contentType: 'image/jpeg' });
    expect(absent.status).toBe(200);
    expect(absent.body.symbol).toBeUndefined();
  });

  it('400 when no chart file is attached', async () => {
    const res = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .field('meta', '{}');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('400 when meta is not valid JSON', async () => {
    const res = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .field('meta', 'not-json')
      .attach('chart', img, { filename: 'c.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('400 when the uploaded file is not an image', async () => {
    const res = await request(createApp(makeConfig()))
      .post('/api/v1/analyze')
      .attach('chart', Buffer.from('%PDF-'), { filename: 'c.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_REQUEST');
  });

  it('413 when the upload exceeds the size limit', async () => {
    const res = await request(createApp(makeConfig({ maxUploadBytes: 8 })))
      .post('/api/v1/analyze')
      .attach('chart', Buffer.from('way-too-many-bytes'), { filename: 'c.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(413);
    expect(res.body.error.code).toBe('IMAGE_TOO_LARGE');
  });
});
