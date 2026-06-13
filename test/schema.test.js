import { describe, it, expect } from 'vitest';
import { analysisResultSchema, validateAnalysis } from '../src/schema/analysisResult.js';

const valid = {
  id: '11111111-1111-1111-1111-111111111111',
  createdAt: '2026-06-13T10:30:00.000Z',
  summary: 's',
  trend: 'bullish',
  confidence: 0.7,
  patterns: [{ name: 'p', description: 'd' }],
  indicators: [{ name: 'RSI', value: '70', interpretation: 'overbought' }],
  supportLevels: [1.08],
  resistanceLevels: [1.1],
  suggestion: { bias: 'wait', entry: 'e', stopLoss: 'sl', takeProfit: 'tp', rationale: 'r', disclaimer: 'This is not financial advice.' },
  rawAnalysis: '# A',
};

describe('analysisResultSchema', () => {
  it('accepts a valid result', () => {
    expect(() => validateAnalysis(valid)).not.toThrow();
  });

  it('rejects an invalid trend enum', () => {
    expect(() => validateAnalysis({ ...valid, trend: 'sideways' })).toThrow();
  });

  it('rejects a missing required field', () => {
    const { summary, ...missing } = valid;
    expect(() => validateAnalysis(missing)).toThrow();
  });

  it('rejects confidence out of 0..1 range', () => {
    expect(() => validateAnalysis({ ...valid, confidence: 1.5 })).toThrow();
  });
});
