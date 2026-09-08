import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Sends legacy /login and /register URLs to the home-page auth modal. */
export function redirectToAuthModal(mode: 'login' | 'register'): CanActivateFn {
  return (route) => {
    const router = inject(Router);
    const queryParams: Record<string, string> = { auth: mode };

    const returnUrl = route.queryParamMap.get('returnUrl');
    const socialError = route.queryParamMap.get('social_error');

    if (returnUrl) {
      queryParams['returnUrl'] = returnUrl;
    }
    if (socialError) {
      queryParams['social_error'] = socialError;
    }

    return router.createUrlTree(['/'], { queryParams });
  };
}
