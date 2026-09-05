import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TravellerAuthService } from '../services/traveller-auth.service';

/** Attaches Sanctum Bearer token for Laravel API calls; ignores Supabase traffic. */
export const travellerAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(TravellerAuthService);
  const apiBase = environment.apiUrl.replace(/\/$/, '');
  const isApiRequest = req.url.startsWith(apiBase);
  const token = auth.getToken();

  const authReq =
    token && isApiRequest
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        })
      : isApiRequest
        ? req.clone({
            setHeaders: {
              Accept: 'application/json',
            },
          })
        : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      const isPublicAuth =
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/forgot-password') ||
        req.url.includes('/auth/reset-password') ||
        req.url.includes('/auth/logout');

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        isApiRequest &&
        !isPublicAuth
      ) {
        auth.logoutAndRedirect('/login');
      }

      return throwError(() => error);
    }),
  );
};
