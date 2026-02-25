import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from '../shared/services/user.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

export const roleGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const router = inject(Router);
  const userService = inject(UserService);
  const allowedRoles = route.data['roles'] as string[];

  return userService.currentUser$.pipe(
    map(user => {
      if (!user || !user.role) {
        router.navigate(['/signin']); // redirige si pas de user ou rôle
        return false;
      }

      if (allowedRoles.includes(user.role)) {
        return true; // accès autorisé
      }

      router.navigate(['/unauthorized']); // rôle non autorisé
      return false;
    })
  );
};