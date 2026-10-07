import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="header-container">
        <a class="brand" routerLink="/" aria-label="Ir al inicio">
          <span class="brand-mark">A</span>
          <span class="brand-text">Antes de Decidir</span>
        </a>

        <nav class="main-nav" aria-label="Navegación principal">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Inicio</a>
          <a routerLink="/herramientas" routerLinkActive="active">Herramientas</a>
          @if (auth.logueado()) {
            <a routerLink="/mi-camino" routerLinkActive="active">Mi Camino</a>
            <a routerLink="/historial" routerLinkActive="active">Historial</a>
          }
        </nav>

        <div class="header-actions">
          @if (auth.logueado()) {
            <span class="header-name">{{ auth.usuario()?.nombre }}</span>
            <a class="secondary-button header-button" routerLink="/nueva">Nueva situación</a>
            <button class="primary-button header-button" type="button" (click)="salir()">Salir</button>
          } @else {
            <a class="login-link" routerLink="/login">Iniciar sesión</a>
            <a class="primary-button header-button" routerLink="/registro">Comenzar</a>
          }
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-outlet />
    </main>

    <footer class="site-footer">
      <div class="footer-container">
        <div>
          <div class="footer-brand">Antes de Decidir</div>
          <p>Comprende la situación. Analiza tus opciones. Decide con más claridad.</p>
        </div>
        <div class="footer-copy">
          <span>© 2026 Antes de Decidir</span>
          <span>Te ayuda a entender, no decide por ti.</span>
        </div>
      </div>
    </footer>
  `,
})
export class Root {
  auth = inject(AuthService);
  private router = inject(Router);

  salir() {
    this.auth.cerrarSesion();
    this.router.navigate(['/']);
  }
}
