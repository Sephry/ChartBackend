import { randomUUID } from 'node:crypto';
import { createMockProvider } from './providers/mockProvider.js';
import { createAnthropicProvider } from './providers/anthropicProvider.js';
import { createOpenAIProvider } from './providers/openaiProvider.js';
import { createGeminiProvider } from './providers/geminiProvider.js';
import { validateCore, validateAnalysis } from '../schema/analysisResult.js';
import { AppError } from '../errors.js';

const DISCLAIMER = 'This is not financial advice.';

function buildProvider(config) {
  switch (config.aiProvider) {
    case 'anthropic': return createAnthropicProvider(config);
    case 'openai': return createOpenAIProvider(config);
    case 'gemini': return createGeminiProvider(config);
    default: return createMockProvider();
  }
}

export function createAiService(config) {
  const provider = buildProvider(config);

  const service = {
    providerName: config.aiProvider,
    _providerForTest: null,
    async analyze({ imageBuffer, mimeType, meta }) {
      const impl = service._providerForTest ?? provider;

      let raw;
      try {
        raw = await impl.analyzeChart({ imageBuffer, mimeType, meta });
      } catch (err) {
        throw new AppError(502, 'PROVIDER_ERROR', `AI provider failed: ${err.message}`);
      }

      let core;
      try {
        core = validateCore(raw);
      } catch {
        throw new AppError(502, 'INVALID_AI_RESPONSE', 'AI response did not match the expected schema.');
      }

      // Guarantee a meaningful disclaimer.
      if (!/not financial advice/i.test(core.suggestion.disclaimer ?? '')) {
        core.suggestion.disclaimer = DISCLAIMER;
      }

      const result = { id: randomUUID(), createdAt: new Date().toISOString(), ...core };
      return validateAnalysis(result);
    },
  };
  return service;
}
