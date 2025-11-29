import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Admin Guard
 * Protects routes that require admin role
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url },
    });
    return false;
  }

  if (!authService.isAdmin()) {
    // Redirect non-admin users to a restricted page or show error
    router.navigate(['/dashboard'], {
      queryParams: { error: 'unauthorized' },
    });
    return false;
  }

  return true;
};

