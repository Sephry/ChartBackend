# ChartBackend

Express.js (ESM) API for the ChartAI app. Returns the `AnalysisResult` contract the iOS app decodes.

## Run

```bash
npm install
cp .env.example .env   # defaults work as-is (mock provider, App Check off)
npm start              # http://localhost:8080
```

Health check: `GET /health` → `{ "status": "ok", "provider": "mock", "appCheckEnforced": false }`

## Analyze

`POST /api/v1/analyze` — `multipart/form-data`:
- `chart`: image file (JPEG/PNG)
- `meta`: JSON string (optional `symbol`, `timeframe`, `note`, `depth`)

## Env vars

See `.env.example`. Key ones:
- `AI_PROVIDER` — `mock` (default), `anthropic`, `openai`, or `gemini`
- `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` (default `claude-opus-4-8`) — required when `AI_PROVIDER=anthropic`
- `OPENAI_API_KEY` / `OPENAI_MODEL` (default `gpt-4o`) — required when `AI_PROVIDER=openai`
- `GEMINI_API_KEY` / `GEMINI_MODEL` (default `gemini-2.5-flash`) — required when `AI_PROVIDER=gemini`
- `APP_CHECK_ENFORCED` — `false` (default). When `true`, requires a valid `X-Firebase-AppCheck` header (needs Firebase Admin credentials).
- `LOG_FORMAT` — morgan HTTP log format. Defaults to `dev` locally and `combined` in production; request logging is silenced during tests.

## Test

```bash
npm test
```

## Docker

```bash
docker build -t chartbackend .
# Mock provider (no key), maps container :8080 to host :8080
docker run --rm -p 8080:8080 chartbackend
# Real provider — pass config at runtime (secrets are NOT baked into the image)
docker run --rm -p 8080:8080 --env-file .env chartbackend
```

The image runs as the non-root `node` user and includes a `/health` healthcheck.
`PORT` is configurable via env (default `8080`); adjust the `-p` mapping to match.

## Switching to a real AI provider

```bash
AI_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-ant-... npm start
AI_PROVIDER=openai    OPENAI_API_KEY=sk-...      npm start
AI_PROVIDER=gemini    GEMINI_API_KEY=...         npm start
```
No other code change — the iOS app keeps calling the same endpoint.
