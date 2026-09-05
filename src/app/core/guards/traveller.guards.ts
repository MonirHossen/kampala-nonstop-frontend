import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { TravellerAuthService } from '../services/traveller-auth.service';

/** Protects traveller dashboard routes. */
export const travellerGuard: CanActivateFn = (_route, state) => {
  const auth = inject(TravellerAuthService);
  const router = inject(Router);

  return auth.bootstrap().pipe(
    map((ok) => {
      if (ok) {
        return true;
      }

      return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url },
      });
    }),
  );
};

/** Keeps signed-in travellers out of login / register / password pages. */
export const travellerGuestGuard: CanActivateFn = () => {
  const auth = inject(TravellerAuthService);
  const router = inject(Router);

  return auth.bootstrap().pipe(
    map((ok) => {
      if (!ok) {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    }),
  );
};
