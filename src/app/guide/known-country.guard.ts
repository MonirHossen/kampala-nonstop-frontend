import { CanMatchFn } from '@angular/router';
import { COUNTRIES } from '../core/lib/countries';

/** Lets `/:countryCode/guide` match only real ISO country codes. */
export const knownCountryMatch: CanMatchFn = (_route, segments) => {
  const code = segments[0]?.path ?? '';
  return COUNTRIES.some((country) => country.code.toLowerCase() === code.toLowerCase());
};
