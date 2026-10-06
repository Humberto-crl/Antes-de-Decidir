import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav">
      <div class="container nav-in">
        <a routerLink="/" class="brand">🧭 Antes de Decidir</a>
        <nav class="links">
          <a routerLink="/herramientas" routerLinkActive="activo">Herramientas</a>
          @if (auth.logueado()) {
            <a routerLink="/mi-camino" routerLinkActive="activo">Mi camino</a>
            <a routerLink="/historial" routerLinkActive="activo">Historial</a>
          }
        </nav>
        <div class="nav-user">
          @if (auth.logueado()) {
            <a class="btn btn-primary btn-sm" routerLink="/nueva">+ Nueva situación</a>
            <span class="muted small">{{ auth.usuario()?.nombre }}</span>
            <button class="btn btn-ghost btn-sm" (click)="salir()">Salir</button>
          } @else {
            <a class="btn btn-ghost btn-sm" routerLink="/login">Entrar</a>
            <a class="btn btn-primary btn-sm" routerLink="/registro">Crear cuenta</a>
          }
        </div>
      </div>
    </header>

    <main class="container page"><router-outlet /></main>

    <footer class="foot">
      Antes de Decidir · Te ayuda a entender, no decide por ti.
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
