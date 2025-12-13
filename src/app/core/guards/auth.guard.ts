import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('[AuthGuard] Checking auth for route:', state.url);

  // Wait for auth to be initialized
  await firstValueFrom(
    authService.authInitialized$.pipe(
      filter(initialized => {
        console.log('[AuthGuard] authInitialized value:', initialized);
        return initialized === true;
      })
    )
  );

  const currentUser = authService.getCurrentUser();
  const firebaseUser = authService.getFirebaseUser();

  console.log('[AuthGuard] Auth check complete:', {
    hasUser: !!currentUser,
    hasFirebaseUser: !!firebaseUser,
    email: currentUser?.email || firebaseUser?.email,
    role: currentUser?.role
  });

  // User is fully authenticated (Firebase + backend)
  if (currentUser) {
    console.log('[AuthGuard] Access granted to:', state.url);
    return true;
  }

  // User is authenticated in Firebase but not registered in backend
  if (firebaseUser && !currentUser) {
    console.log('[AuthGuard] User needs registration, redirecting to complete-registration');
    router.navigate(['/auth/complete-registration'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // User is not authenticated
  console.log('[AuthGuard] Access denied, redirecting to login from:', state.url);
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  return false;
};

export const publicGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be initialized
  await firstValueFrom(
    authService.authInitialized$.pipe(
      filter(initialized => initialized === true)
    )
  );

  const currentUser = authService.getCurrentUser();

  // If user is authenticated, redirect to dashboard
  if (currentUser) {
    const dashboardRoute = authService.getDashboardRoute();
    router.navigate([dashboardRoute]);
    return false;
  }

  return true;
};

export const registrationGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to be initialized
  await firstValueFrom(
    authService.authInitialized$.pipe(
      filter(initialized => initialized === true)
    )
  );

  const currentUser = authService.getCurrentUser();
  const firebaseUser = authService.getFirebaseUser();

  // User needs to complete registration (has Firebase but not backend user)
  if (firebaseUser && !currentUser) {
    return true;
  }

  // User is already registered, redirect to dashboard
  if (currentUser) {
    const dashboardRoute = authService.getDashboardRoute();
    router.navigate([dashboardRoute]);
    return false;
  }

  // No Firebase user, redirect to login
  router.navigate(['/auth/login']);
  return false;
};
