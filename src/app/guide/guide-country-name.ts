import { COUNTRIES } from '../core/lib/countries';

/** Resolve a display name for an ISO country code; falls back to the code. */
export function countryDisplayName(code: string): string {
  const normalised = code.trim().toUpperCase();
  const match = COUNTRIES.find((country) => country.code === normalised);
  return match?.name ?? normalised;
}
