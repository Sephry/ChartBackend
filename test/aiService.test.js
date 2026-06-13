import { describe, it, expect } from 'vitest';
import { createAiService } from '../src/services/aiService.js';
import { analysisResultSchema } from '../src/schema/analysisResult.js';

const baseConfig = { aiProvider: 'mock', anthropicApiKey: '', anthropicModel: 'claude-opus-4-8', anthropicMaxTokens: 16000 };

describe('aiService (mock)', () => {
  it('returns a schema-valid result with server-stamped id/createdAt', async () => {
    const service = createAiService(baseConfig);
    expect(service.providerName).toBe('mock');
    const result = await service.analyze({ imageBuffer: Buffer.from('x'), mimeType: 'image/jpeg', meta: {} });
    expect(() => analysisResultSchema.parse(result)).not.toThrow();
    expect(result.id).toBeTruthy();
    expect(result.createdAt).toBeTruthy();
    expect(result.suggestion.disclaimer.toLowerCase()).toContain('not financial advice');
  });

  it('normalizes a missing/weak disclaimer to the standard notice', async () => {
    const service = createAiService(baseConfig);
    service._providerForTest = {
      async analyzeChart() {
        return {
          summary: 's', trend: 'neutral', confidence: 0.5, patterns: [], indicators: [],
          supportLevels: [], resistanceLevels: [],
          suggestion: { bias: 'wait', entry: 'e', stopLoss: 'sl', takeProfit: 'tp', rationale: 'r', disclaimer: '' },
          rawAnalysis: 'x',
        };
      },
    };
    const result = await service.analyze({ imageBuffer: Buffer.from('x'), mimeType: 'image/jpeg', meta: {} });
    expect(result.suggestion.disclaimer.toLowerCase()).toContain('not financial advice');
  });

  it('throws INVALID_AI_RESPONSE when the provider returns malformed core', async () => {
    const service = createAiService(baseConfig);
    service._providerForTest = { async analyzeChart() { return { summary: 's' }; } };
    await expect(
      service.analyze({ imageBuffer: Buffer.from('x'), mimeType: 'image/jpeg', meta: {} })
    ).rejects.toMatchObject({ code: 'INVALID_AI_RESPONSE' });
  });
});

describe('aiService provider selection', () => {
  it('reports providerName=openai and constructs without network', () => {
    const service = createAiService({
      aiProvider: 'openai', openaiApiKey: 'sk-x', openaiModel: 'gpt-4o',
    });
    expect(service.providerName).toBe('openai');
  });

  it('reports providerName=gemini and constructs without network', () => {
    const service = createAiService({
      aiProvider: 'gemini', geminiApiKey: 'g-x', geminiModel: 'gemini-2.5-flash',
    });
    expect(service.providerName).toBe('gemini');
  });
});
