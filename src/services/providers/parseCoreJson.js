// Shared by all real providers: strip optional code fences, parse JSON, throw on failure.
export function parseCoreJson(text) {
  const trimmed = (text ?? '').trim();
  const unfenced = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    : trimmed;
  try {
    return JSON.parse(unfenced);
  } catch {
    throw new Error('Provider returned non-JSON output');
  }
}
