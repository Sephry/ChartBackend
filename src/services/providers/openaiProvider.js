import OpenAI from 'openai';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../prompts/systemPrompt.js';
import { parseCoreJson } from './parseCoreJson.js';

// OpenAI vision adapter. Returns analysis "core"; aiService validates it.
export function createOpenAIProvider(config) {
  const client = new OpenAI({ apiKey: config.openaiApiKey });

  return {
    async analyzeChart({ imageBuffer, mimeType, meta }) {
      const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
      const response = await client.chat.completions.create({
        model: config.openaiModel,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: buildUserPrompt(meta) },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
      });

      const text = response.choices?.[0]?.message?.content ?? '';
      return parseCoreJson(text);
    },
  };
}
