import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh')) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isLoggedIn && !req.url.includes('/auth/')) {
        return auth.refresh().pipe(
          switchMap(newToken => {
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${newToken.accessToken}` }
            });
            return next(cloned);
          }),
          catchError(err => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
