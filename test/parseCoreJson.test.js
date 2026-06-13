import { describe, it, expect } from 'vitest';
import { parseCoreJson } from '../src/services/providers/parseCoreJson.js';

describe('parseCoreJson', () => {
  it('parses plain JSON', () => {
    expect(parseCoreJson('{"a":1}')).toEqual({ a: 1 });
  });

  it('strips ```json fences', () => {
    expect(parseCoreJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('strips bare ``` fences', () => {
    expect(parseCoreJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it('throws on non-JSON', () => {
    expect(() => parseCoreJson('not json at all')).toThrow(/non-JSON/);
  });

  it('throws on null/undefined input', () => {
    expect(() => parseCoreJson(undefined)).toThrow(/non-JSON/);
  });
});
