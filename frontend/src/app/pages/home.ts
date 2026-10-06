import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Categoria } from '../core/models';
import { icono } from '../core/ui';

@Component({
  selector: 'page-home',
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Antes de decidir, entiende.</h1>
      <p>
        Describe tu situación, ordena la información, compara tus opciones y descubre qué te falta saber.
        No decidimos por ti: te ayudamos a decidir con claridad.
      </p>
      <div class="row">
        @if (auth.logueado()) {
          <a class="btn btn-primary" routerLink="/nueva">Analizar una situación</a>
          <a class="btn btn-ghost" routerLink="/mi-camino">Ver mi camino</a>
        } @else {
          <a class="btn btn-primary" routerLink="/registro">Empezar gratis</a>
          <a class="btn btn-ghost" routerLink="/herramientas">Probar las herramientas</a>
        }
      </div>
    </section>

    <h2 class="mt">¿Qué quieres analizar?</h2>
    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
    <div class="grid g3">
      @for (c of categorias(); track c.id_categoria) {
        <a class="card link-card" routerLink="/nueva" [queryParams]="{ categoria: c.id_categoria }">
          <div class="emoji">{{ icono(c.nombre) }}</div>
          <h3>{{ c.nombre }}</h3>
          <p class="muted small">{{ c.descripcion }}</p>
        </a>
      }
    </div>

    <h2 class="mt" style="margin-top:2rem">Cómo funciona</h2>
    <div class="grid g4">
      @for (p of pasos; track p.t) {
        <div class="card">
          <div class="emoji">{{ p.i }}</div>
          <h3>{{ p.t }}</h3>
          <p class="muted small">{{ p.d }}</p>
        </div>
      }
    </div>
  `,
})
export class HomePage implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  categorias = signal<Categoria[]>([]);
  error = signal('');
  icono = icono;

  pasos = [
    { i: '📝', t: 'Describe', d: 'Cuenta tu situación con tus palabras.' },
    { i: '🧩', t: 'Ordena', d: 'Completa los factores que importan.' },
    { i: '⚖️', t: 'Compara', d: 'Analiza alternativas y escenarios.' },
    { i: '✅', t: 'Avanza', d: 'Sigue tu checklist antes de actuar.' },
  ];

  async ngOnInit() {
    try {
      this.categorias.set(await this.api.categorias());
    } catch {
      this.error.set('No se pudieron cargar las categorías. ¿Está encendido el backend?');
    }
  }
}
