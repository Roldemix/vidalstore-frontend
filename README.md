# VidalStore · Frontend

Aplicación Angular con AWS Amplify contra el user pool de Cognito del
proyecto VidalStore (DSY1107). Ver el README del backend
(`vidalstore-backend`) para la arquitectura completa y los datos de
configuración de Cognito.

## Requisitos previos

- Node.js 20+ y npm.
- El gateway (`vidalstore-backend/gateway`) corriendo en
  `http://localhost:8080`, ya que el catálogo, las compras y la biblioteca
  dependen de él.

## Levantamiento

```bash
npm install
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Configuración de Amplify

Los datos de conexión a Cognito están en `src/amplify-config.ts`:

```typescript
export const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_X943Nbyxr',
      userPoolClientId: '4u00fq0k17u5r7ldm7rn1jm9hj',
      region: 'us-east-1',
    },
  },
};
```

`userPoolId` y `userPoolClientId` son públicos por diseño (cualquiera puede
verlos inspeccionando el bundle de la aplicación en el navegador), por lo
que se versionan con su valor real sin problema.

## Funcionalidades implementadas

- **Registro** (`/register`): creación de cuenta con email/contraseña y
  confirmación por código enviado al correo (Amplify `signUp` +
  `confirmSignUp`).
- **Login** (`/login`): formulario propio (no Hosted UI), usando Amplify
  `signIn`.
- **Guard de rutas** (`auth-guard.ts`): protege la ruta raíz (`/`)
  verificando que exista una sesión activa (`getCurrentUser`); si no la hay,
  redirige a `/login`.
- **Interceptor HTTP** (`auth-interceptor.ts`): adjunta el `access_token`
  únicamente a las peticiones dirigidas al gateway
  (`http://localhost:8080`), definido en una lista explícita de destinos
  permitidos. Cualquier otra petición pasa sin el token.
- **Lectura de claims**: `AuthService.getUserGroups()` extrae
  `cognito:groups` del `access_token` para mostrar u ocultar elementos de
  la interfaz según el rol.
- **Catálogo, compra y biblioteca**: la vista `Home` consume el gateway a
  través del servicio `Catalogo` (`src/app/catalogo.ts`), que usa
  `HttpClient` (y por lo tanto pasa por el interceptor automáticamente).

