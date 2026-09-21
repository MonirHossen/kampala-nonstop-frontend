/**
 * Shared editorial content helpers for the guide.
 *
 * Provides narrative block typings, pull-quote detection and content-driven
 * figure placement so the same blocks render consistently across pages.
 */

export type GuideNarrativeBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'subheading'; text: string }
  | { type: 'list'; items: { label?: string; text: string }[] }
  | { type: 'rates'; rows: { currency: string; range: string }[] };

const QUOTE_OPENERS = ['“', '"', '‘', "'"] as const;
const QUOTE_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ['“', '”'],
  ['"', '"'],
  ['‘', '’'],
  ["'", "'"],
];

export function isQuoteParagraph(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed.length < 2) {
    return false;
  }
  return (QUOTE_OPENERS as readonly string[]).includes(trimmed[0]);
}

export function stripOuterQuotes(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length < 3) {
    return trimmed;
  }
  const first = trimmed[0];
  const last = trimmed[trimmed.length - 1];
  for (const [open, close] of QUOTE_PAIRS) {
    if (first === open && last === close) {
      return trimmed.slice(1, -1).trim();
    }
  }
  return trimmed;
}