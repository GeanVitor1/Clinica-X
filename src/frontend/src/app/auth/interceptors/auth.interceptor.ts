import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

const AUTH_PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/public/confirmar',
];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const isPublicAuth = AUTH_PUBLIC_PATHS.some((p) => req.url.includes(p));

  // Só anexa Bearer em rotas autenticadas
  if (token && !isPublicAuth) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err) => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        // Não desloga em falha de login/register (credenciais inválidas)
        if (!isPublicAuth && token) {
          auth.logout();
        }
      }
      return throwError(() => err);
    })
  );
};
