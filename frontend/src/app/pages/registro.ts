import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { mensajeError } from '../core/api.service';

@Component({
  selector: 'page-registro',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="card auth">
      <h2>Crear cuenta</h2>
      <p class="muted small">Guarda tus análisis y sigue tu progreso.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <div class="row" style="align-items:flex-start">
        <label class="field" style="flex:1"><span>Nombre</span><input [(ngModel)]="d.nombre" /></label>
        <label class="field" style="flex:1"><span>Apellido</span><input [(ngModel)]="d.apellido" /></label>
      </div>
      <label class="field"><span>Correo</span><input type="email" [(ngModel)]="d.correo" /></label>
      <label class="field"><span>Contraseña</span>
        <input type="password" [(ngModel)]="d.password" (keyup.enter)="crear()" />
        <small>Mínimo 8 caracteres.</small>
      </label>
      <button class="btn btn-primary" style="width:100%" [disabled]="cargando()" (click)="crear()">
        {{ cargando() ? 'Creando...' : 'Crear cuenta' }}
      </button>
      <p class="center small mt">¿Ya tienes cuenta? <a routerLink="/login">Iniciar sesión</a></p>
    </div>
  `,
})
export class RegistroPage {
  private auth = inject(AuthService);
  private router = inject(Router);
  d = { nombre: '', apellido: '', correo: '', password: '' };
  error = signal('');
  cargando = signal(false);

  async crear() {
    this.error.set('');
    this.cargando.set(true);
    try {
      await this.auth.registro(this.d);
      this.router.navigate(['/mi-camino']);
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
