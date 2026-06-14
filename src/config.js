import 'dotenv/config';

function int(value, fallback) {
  const n = Number.parseInt(value ?? '', 10);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value, fallback = false) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

// Express 'trust proxy' value. Accepts a hop count (e.g. "1"), a boolean,
// or a pass-through string (subnet/keyword like "loopback", "10.0.0.0/8").
function trustProxy(value, fallback) {
  if (value === undefined || value === '') return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  const n = Number(value);
  return Number.isInteger(n) ? n : value;
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
    anthropicModel: env.ANTHROPIC_MODEL ?? '',
    anthropicMaxTokens: int(env.ANTHROPIC_MAX_TOKENS, 16000),
    openaiApiKey: env.OPENAI_API_KEY ?? '',
    openaiModel: env.OPENAI_MODEL ?? '',
    geminiApiKey: env.GEMINI_API_KEY ?? '',
    geminiModel: env.GEMINI_MODEL ?? '',
    appCheckEnforced: bool(env.APP_CHECK_ENFORCED, false),
    trustProxy: trustProxy(env.TRUST_PROXY, 1),
    logFormat: 'dev',
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
