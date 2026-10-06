import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/api.service';

@Component({
  selector: 'page-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card auth">
      <h2>Iniciar sesión</h2>
      <p class="muted small">Entra para ver tus situaciones y tu progreso.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <label class="field"><span>Correo</span>
        <input type="email" [(ngModel)]="correo" placeholder="tu@correo.com" />
      </label>
      <label class="field"><span>Contraseña</span>
        <input type="password" [(ngModel)]="password" (keyup.enter)="entrar()" />
      </label>
      <button class="btn btn-primary" style="width:100%" [disabled]="cargando()" (click)="entrar()">
        {{ cargando() ? 'Entrando...' : 'Entrar' }}
      </button>
      <p class="center small mt">¿No tienes cuenta? <a routerLink="/registro">Crear cuenta</a></p>
    </div>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  correo = '';
  password = '';
  error = signal('');
  cargando = signal(false);

  async entrar() {
    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.login(this.correo, this.password);
      this.router.navigate(['/mi-camino']);
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
