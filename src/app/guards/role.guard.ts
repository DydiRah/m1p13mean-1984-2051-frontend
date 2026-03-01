import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { Observable } from 'rxjs';

import { first, map } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);
  const allowedRoles = route.data['roles'] as string[];

  // Ici on attend la première valeur du currentUser$
  return userService.loadCurrentUser().pipe(
    first(), // on ne prend qu'une seule émission
    map(user => {
      if (!user) {
        router.navigate(['/signin']);
        return false;
      }

      if (!allowedRoles.includes(user.role!)) {
        router.navigate(['/unauthorized']);
        return false;
      }

      return true; // tout est ok
    })
  );
};