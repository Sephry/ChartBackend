import 'dotenv/config';

function int(value, fallback) {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

const KEY_BY_PROVIDER = {
  anthropic: ['anthropicApiKey', 'ANTHROPIC_API_KEY'],
  openai: ['openaiApiKey', 'OPENAI_API_KEY'],
  gemini: ['geminiApiKey', 'GEMINI_API_KEY'],
};

export function loadConfig(env = process.env) {
  const aiProvider = (env.AI_PROVIDER ?? 'mock').toLowerCase();

  const config = {
    port: int(env.PORT, 8080),
    aiProvider,
    anthropicApiKey: env.ANTHROPIC_API_KEY ?? '',
    anthropicModel: env.ANTHROPIC_MODEL ?? 'claude-opus-4-8',
    anthropicMaxTokens: int(env.ANTHROPIC_MAX_TOKENS, 16000),
    openaiApiKey: env.OPENAI_API_KEY ?? '',
    openaiModel: env.OPENAI_MODEL ?? 'gpt-4o',
    geminiApiKey: env.GEMINI_API_KEY ?? '',
    geminiModel: env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    appCheckEnforced: bool(env.APP_CHECK_ENFORCED, false),
    logFormat: env.LOG_FORMAT ?? ((env.NODE_ENV ?? 'development') === 'production' ? 'combined' : 'dev'),
    corsOrigins: (env.CORS_ORIGINS ?? '*').split(',').map((s) => s.trim()).filter(Boolean),
    maxUploadBytes: int(env.MAX_UPLOAD_BYTES, 5 * 1024 * 1024),
    rateLimit: {
      windowMs: int(env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
      max: int(env.RATE_LIMIT_MAX, 30),
    },
  };

  if (!['mock', 'anthropic', 'openai', 'gemini'].includes(config.aiProvider)) {
    throw new Error(`Unknown AI_PROVIDER: ${config.aiProvider}`);
  }
  const required = KEY_BY_PROVIDER[config.aiProvider];
  if (required && !config[required[0]]) {
    throw new Error(`AI_PROVIDER=${config.aiProvider} requires ${required[1]}`);
  }
  return config;
}
