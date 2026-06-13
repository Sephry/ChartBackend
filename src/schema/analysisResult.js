import { z } from 'zod';

export const trendSchema = z.enum(['bullish', 'bearish', 'neutral']);
export const biasSchema = z.enum(['long', 'short', 'wait']);

export const patternSchema = z.object({
  name: z.string(),
  description: z.string(),
});

export const indicatorSchema = z.object({
  name: z.string(),
  value: z.string(),
  interpretation: z.string(),
});

export const suggestionSchema = z.object({
  bias: biasSchema,
  entry: z.string(),
  stopLoss: z.string(),
  takeProfit: z.string(),
  rationale: z.string(),
  // Lenient here; aiService guarantees a real "not financial advice" disclaimer.
  disclaimer: z.string(),
});

// What a provider returns — no server-generated id/createdAt.
export const analysisCoreSchema = z.object({
  summary: z.string(),
  trend: trendSchema,
  confidence: z.number().min(0).max(1),
  patterns: z.array(patternSchema),
  indicators: z.array(indicatorSchema),
  supportLevels: z.array(z.number()),
  resistanceLevels: z.array(z.number()),
  suggestion: suggestionSchema,
  rawAnalysis: z.string(),
});

// The full contract returned to the client.
export const analysisResultSchema = analysisCoreSchema.extend({
  id: z.string().min(1),
  createdAt: z.string().min(1),
});

export function validateAnalysis(obj) {
  return analysisResultSchema.parse(obj);
}

export function validateCore(obj) {
  return analysisCoreSchema.parse(obj);
}
