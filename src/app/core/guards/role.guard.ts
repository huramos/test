import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    console.log('[RoleGuard] Checking role for route:', state.url, 'allowed roles:', allowedRoles);

    // Esperar a que authInitialized sea true
    await firstValueFrom(
      authService.authInitialized$.pipe(
        filter(initialized => {
          console.log('[RoleGuard] authInitialized value:', initialized);
          return initialized === true;
        })
      )
    );

    const currentUser = authService.getCurrentUser();
    console.log('[RoleGuard] Current user:', {
      hasUser: !!currentUser,
      role: currentUser?.role,
      allowedRoles
    });

    if (!currentUser) {
      console.log('[RoleGuard] No user, redirecting to login');
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles.includes(currentUser.role)) {
      console.log('[RoleGuard] Role check passed');
      return true;
    }

    console.log('[RoleGuard] Role check failed, redirecting to appropriate dashboard');
    router.navigate([authService.getDashboardRoute()]);
    return false;
  };
};