# Frontend - Antes de Decidir (Angular)

Archivos fuente para colocar sobre un proyecto creado con `ng new`.
Backend esperado en http://localhost:3000/api (se cambia en src/app/core/config.ts).

## Estructura
src/main.ts                  arranque de la app
src/styles.css               estilos globales
src/app/root.ts              barra de navegación + <router-outlet>
src/app/app.config.ts        proveedores (rutas, HttpClient, interceptor)
src/app/app.routes.ts        rutas de la aplicación
src/app/core/                servicios (API, sesión), guard, interceptor, modelos
src/app/pages/               pantallas (inicio, login, registro, mi camino, nueva, detalle, historial, herramientas)
src/app/tabs/                pestañas de la pantalla de detalle de una situación
