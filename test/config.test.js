import { describe, it, expect } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig provider validation', () => {
  it('defaults to mock with no env', () => {
    const c = loadConfig({});
    expect(c.aiProvider).toBe('mock');
  });

  it('throws when openai is selected without a key', () => {
    expect(() => loadConfig({ AI_PROVIDER: 'openai' })).toThrow(/OPENAI_API_KEY/);
  });

  it('throws when gemini is selected without a key', () => {
    expect(() => loadConfig({ AI_PROVIDER: 'gemini' })).toThrow(/GEMINI_API_KEY/);
  });

  it('accepts openai with a key and exposes the model default', () => {
    const c = loadConfig({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'sk-x' });
    expect(c.aiProvider).toBe('openai');
    expect(c.openaiModel).toBe('gpt-4o');
  });

  it('accepts gemini with a key and exposes the model default', () => {
    const c = loadConfig({ AI_PROVIDER: 'gemini', GEMINI_API_KEY: 'g-x' });
    expect(c.aiProvider).toBe('gemini');
    expect(c.geminiModel).toBe('gemini-2.5-flash');
  });

  it('rejects an unknown provider', () => {
    expect(() => loadConfig({ AI_PROVIDER: 'llama' })).toThrow(/Unknown AI_PROVIDER/);
  });

  it('defaults logFormat to "dev" outside production', () => {
    expect(loadConfig({ NODE_ENV: 'development' }).logFormat).toBe('dev');
  });

  it('defaults logFormat to "combined" in production', () => {
    expect(loadConfig({ NODE_ENV: 'production' }).logFormat).toBe('combined');
  });

  it('honors an explicit LOG_FORMAT', () => {
    expect(loadConfig({ LOG_FORMAT: 'tiny' }).logFormat).toBe('tiny');
  });
});
