import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

/**
 * Guard para proteger rutas que requieren autenticación
 * Redirige a login si no hay token activo
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

/**
 * Guard para prevenir que usuarios autenticados accedan a login/register
 * Redirige a home si ya hay un token activo
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};
