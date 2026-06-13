import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT, buildUserPrompt } from '../../prompts/systemPrompt.js';
import { parseCoreJson } from './parseCoreJson.js';

// Google Gemini vision adapter. Returns analysis "core"; aiService validates it.
export function createGeminiProvider(config) {
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  return {
    async analyzeChart({ imageBuffer, mimeType, meta }) {
      const response = await ai.models.generateContent({
        model: config.geminiModel,
        contents: [
          {
            role: 'user',
            parts: [
              { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
              { text: buildUserPrompt(meta) },
            ],
          },
        ],
        config: { systemInstruction: SYSTEM_PROMPT },
      });

      return parseCoreJson(response.text);
    },
  };
}
