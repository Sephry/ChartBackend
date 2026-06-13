import Anthropic from '@anthropic-ai/sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../prompts/systemPrompt.js';
import { parseCoreJson } from './parseCoreJson.js';

// Claude vision adapter. Returns analysis "core" (no id/createdAt); aiService validates it.
export function createAnthropicProvider(config) {
  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  return {
    async analyzeChart({ imageBuffer, mimeType, meta }) {
      const response = await client.messages.create({
        model: config.anthropicModel,
        max_tokens: config.anthropicMaxTokens,
        thinking: { type: 'adaptive' },
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: { type: 'base64', media_type: mimeType, data: imageBuffer.toString('base64') },
              },
              { type: 'text', text: buildUserPrompt(meta) },
            ],
          },
        ],
      });

      const text = response.content
        .filter((b) => b.type === 'text')
        .map((b) => b.text)
        .join('');

      return parseCoreJson(text);
    },
  };
}
