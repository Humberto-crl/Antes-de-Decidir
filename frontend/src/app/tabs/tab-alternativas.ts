import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, mensajeError } from '../core/api.service';
import { Alternativa, Factor, SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-alternativas',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="row between mb">
      <div>
        <h2>Alternativas</h2>
        <p class="muted small">Las opciones entre las que estás eligiendo. Necesitas al menos 2 para compararlas.</p>
      </div>
      <button class="btn btn-primary btn-sm" (click)="mostrarForm.set(!mostrarForm())">
        {{ mostrarForm() ? 'Cancelar' : '+ Agregar alternativa' }}
      </button>
    </div>
    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

    @if (mostrarForm()) {
      <div class="card mb">
        <label class="field"><span>Nombre</span><input [(ngModel)]="nombre" placeholder="Ej: Oferta A" /></label>
        <label class="field"><span>Descripción (opcional)</span><input [(ngModel)]="descripcion" /></label>
        <h3>Valores por factor (opcional)</h3>
        <div class="grid g2">
          @for (f of catalogo(); track f.id_factor) {
            <label class="field"><span>{{ f.nombre }}</span><input [(ngModel)]="valores[f.id_factor]" /></label>
          }
        </div>
        <button class="btn btn-primary" [disabled]="guardando()" (click)="crear()">Guardar alternativa</button>
      </div>
    }

    <div class="grid g2">
      @for (a of alternativas(); track a.id_alternativa) {
        <div class="card">
          <div class="row between">
            <h3>{{ a.nombre }}</h3>
            <button class="btn btn-danger btn-sm" (click)="eliminar(a)">Quitar</button>
          </div>
          @if (a.descripcion) { <p class="muted small">{{ a.descripcion }}</p> }
          <ul class="list">
            @for (f of a.factores; track f.id_factor) {
              <li class="grow"><span class="muted">{{ f.factor }}</span><b>{{ f.valor }}</b></li>
            } @empty {
              <li class="muted small">Sin valores todavía.</li>
            }
          </ul>
        </div>
      } @empty {
        <div class="card empty" style="grid-column: 1 / -1">
          Aún no hay alternativas. Agrega la primera.
        </div>
      }
    </div>

    <p class="muted small mt">
      ¿Tus opciones son ofertas de trabajo? Usa el <a routerLink="/herramientas">comparador</a> para ver cuál te deja más dinero y tiempo.
    </p>
  `,
})
export class TabAlternativas implements OnInit {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();
  cambio = output<void>();

  alternativas = signal<Alternativa[]>([]);
  catalogo = signal<Factor[]>([]);
  mostrarForm = signal(false);
  guardando = signal(false);
  error = signal('');
  nombre = '';
  descripcion = '';
  valores: Record<number, string> = {};

  async ngOnInit() {
    try {
      this.catalogo.set(await this.api.factores(this.situacion().id_categoria));
      await this.cargar();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async cargar() {
    this.alternativas.set(await this.api.alternativas(this.situacion().id_situacion));
  }

  async crear() {
    this.error.set('');
    this.guardando.set(true);
    try {
      const factores = Object.entries(this.valores).map(([id, valor]) => ({ id_factor: Number(id), valor: valor ?? '' }));
      await this.api.crearAlternativa(this.situacion().id_situacion, {
        nombre: this.nombre, descripcion: this.descripcion, factores,
      });
      this.nombre = ''; this.descripcion = ''; this.valores = {};
      this.mostrarForm.set(false);
      await this.cargar();
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.guardando.set(false);
    }
  }

  async eliminar(a: Alternativa) {
    if (!confirm(`¿Quitar "${a.nombre}"?`)) return;
    try {
      await this.api.eliminarAlternativa(this.situacion().id_situacion, a.id_alternativa);
      await this.cargar();
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
