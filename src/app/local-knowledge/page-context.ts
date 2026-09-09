import { ActivatedRouteSnapshot } from '@angular/router';

const DEFAULT_CONTEXT = 'HOME';

export function localKnowledgeContextFrom(snapshot: ActivatedRouteSnapshot | null): string {
  let route = snapshot;
  let context = DEFAULT_CONTEXT;

  while (route) {
    const value = route.data['localKnowledgeContext'];
    if (typeof value === 'string' && value.trim() !== '') {
      context = value;
    }
    route = route.firstChild;
  }

  return context;
}

export function countryCodeFromUrl(url: string): string {
  const match = url.split('?')[0].match(/^\/+([a-z]{2})(?:\/|$)/i);
  return match ? match[1].toUpperCase() : 'UG';
}
