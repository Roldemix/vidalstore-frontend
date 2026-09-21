import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { fetchAuthSession } from 'aws-amplify/auth';

// Lista explícita de destinos permitidos para adjuntar el token.
// Hoy solo el gateway de VidalStore.
const ALLOWED_DESTINATIONS = ['http://localhost:8080'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isAllowedDestination = ALLOWED_DESTINATIONS.some((url) =>
    req.url.startsWith(url),
  );

  if (!isAllowedDestination) {
    return next(req);
  }

  return from(fetchAuthSession()).pipe(
    switchMap((session) => {
      const token = session.tokens?.accessToken?.toString();

      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });

      return next(authReq);
    }),
  );
};