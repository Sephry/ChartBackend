// Returns analysis "core" (no id/createdAt) so the app + iOS run with no API key.
export function createMockProvider() {
  return {
    async analyzeChart(/* { imageBuffer, mimeType, meta } */) {
      return {
        summary: 'Short-term uptrend with momentum fading near resistance.',
        trend: 'bullish',
        confidence: 0.66,
        patterns: [
          { name: 'Ascending Triangle', description: 'Higher lows pressing a flat resistance band.' },
          { name: 'Bearish RSI Divergence', description: 'Price higher high while RSI made a lower high.' },
        ],
        indicators: [
          { name: 'RSI (14)', value: '71', interpretation: 'Overbought' },
          { name: 'MACD', value: '+0.0012', interpretation: 'Bullish but flattening' },
        ],
        supportLevels: [1.082, 1.075],
        resistanceLevels: [1.095, 1.101],
        suggestion: {
          bias: 'wait',
          entry: 'Wait for a close above 1.0950 or a pullback to 1.0820.',
          stopLoss: '1.0740',
          takeProfit: '1.1010',
          rationale: 'Uptrend intact but RSI divergence near resistance argues for confirmation.',
          disclaimer: 'This is not financial advice.',
        },
        rawAnalysis: [
          '# Technical Analysis',
          '',
          'The chart shows a **short-term uptrend** with higher lows forming an *ascending triangle* under resistance at **1.0950**.',
          '',
          '## Momentum',
          '- RSI(14) at **71** — overbought.',
          '- Bearish RSI divergence suggests fading momentum.',
          '',
          '_This is not financial advice._',
        ].join('\n'),
      };
    },
  };
}
