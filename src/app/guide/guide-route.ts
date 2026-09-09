import { ActivatedRoute } from '@angular/router';

export function guideCountryCode(route: ActivatedRoute): string {
  let current: ActivatedRoute | null = route;

  while (current) {
    const code = current.snapshot.paramMap.get('countryCode');
    if (code && /^[a-z]{2}$/i.test(code.trim())) {
      return code.trim().toUpperCase();
    }
    current = current.parent;
  }

  return 'UG';
}

export function guideLink(countryCode: string, section = ''): string[] {
  const code = countryCode.trim().toLowerCase() || 'ug';
  return section ? ['/', code, 'guide', section] : ['/', code, 'guide'];
}
