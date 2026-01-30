export function shuffle<T>(array: T[]) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function randomSample<T>(array: T[], n: number) {
  if (n <= 0) return [];
  if (array.length <= n) return [...array];
  return shuffle(array).slice(0, n);
}

export function uniqueChoices(choices: string[], limit?: number) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const choice of choices) {
    if (!seen.has(choice)) {
      seen.add(choice);
      result.push(choice);
    }
    if (limit && result.length >= limit) {
      break;
    }
  }
  return result;
}

export function safeJsonParse<T>(value: string | null | undefined, fallback: T) {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
