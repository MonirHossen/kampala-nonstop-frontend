import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

/** Blocks the admin panel unless the session belongs to an admin. */
export const adminGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.ensureLoaded();
  if (user?.isAdmin) return true;

  return router.createUrlTree(['/admin/login']);
};

/** Keeps signed-in admins away from the login screen. */
export const adminLoginGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = await auth.ensureLoaded();
  if (user?.isAdmin) return router.createUrlTree(['/admin/dashboard']);

  return true;
};
