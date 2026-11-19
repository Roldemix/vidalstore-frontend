import { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap } from 'rxjs';
import { fetchAuthSession } from 'aws-amplify/auth';

// Destinos a los que se les adjunta el token: el gateway local y, en la nube,
// la misma ruta /v1 del propio origen. Nunca se manda el token a terceros.
const GATEWAY_LOCAL = 'http://localhost:8080/v1';
const RUTA_API = '/v1';

function esDestinoPermitido(url: string): boolean {
  if (url === RUTA_API || url.startsWith(`${RUTA_API}/`)) return true;
  if (url.startsWith(GATEWAY_LOCAL)) return true;
  return (
    typeof window !== 'undefined' &&
    (url === `${window.location.origin}${RUTA_API}` ||
      url.startsWith(`${window.location.origin}${RUTA_API}/`))
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!esDestinoPermitido(req.url)) {
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
