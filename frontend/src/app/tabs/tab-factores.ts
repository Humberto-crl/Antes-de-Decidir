import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, mensajeError } from '../core/api.service';
import { Factor, SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-factores',
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2>Factores de tu situación</h2>
      <p class="muted small">Completa lo que sepas. Lo que dejes vacío aparecerá como información faltante en el análisis.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }
      @if (msg()) { <div class="alert alert-ok">{{ msg() }}</div> }

      <div class="grid g2">
        @for (f of catalogo(); track f.id_factor) {
          <label class="field">
            <span>{{ f.nombre }}</span>
            <input [(ngModel)]="valores[f.id_factor]" maxlength="255" />
            @if (f.descripcion) { <small>{{ f.descripcion }}</small> }
          </label>
        }
      </div>
      <button class="btn btn-primary" [disabled]="guardando()" (click)="guardar()">
        {{ guardando() ? 'Guardando...' : 'Guardar factores' }}
      </button>
    </div>
  `,
})
export class TabFactores implements OnInit {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();
  cambio = output<void>();

  catalogo = signal<Factor[]>([]);
  valores: Record<number, string> = {};
  error = signal('');
  msg = signal('');
  guardando = signal(false);

  async ngOnInit() {
    // Carga los valores que ya estaban guardados
    this.situacion().factores.forEach((f) => (this.valores[f.id_factor] = f.valor));
    try {
      this.catalogo.set(await this.api.factores(this.situacion().id_categoria));
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async guardar() {
    this.error.set('');
    this.msg.set('');
    this.guardando.set(true);
    try {
      const lista = Object.entries(this.valores).map(([id, valor]) => ({ id_factor: Number(id), valor: valor ?? '' }));
      await this.api.guardarFactores(this.situacion().id_situacion, lista);
      this.msg.set('Factores guardados');
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.guardando.set(false);
    }
  }
}
