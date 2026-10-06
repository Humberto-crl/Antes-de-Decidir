import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, mensajeError } from '../core/api.service';
import { SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-ia',
  imports: [FormsModule],
  template: `
    <div class="card">
      <h2>Asistente</h2>
      <p class="muted small">
        La IA lee tu situación y te ayuda a interpretarla. <b>No decide por ti</b>: te señala qué mirar y qué preguntar.
      </p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <label class="field"><span>¿Qué quieres entender mejor? (opcional)</span>
        <textarea [(ngModel)]="pregunta" placeholder="Ej: ¿Qué debería revisar antes de aceptar la oferta?"></textarea>
      </label>
      <button class="btn btn-primary" [disabled]="cargando()" (click)="preguntar()">
        {{ cargando() ? 'Pensando...' : 'Pedir ayuda' }}
      </button>

      @if (respuesta()) {
        <div class="card mt" style="background:var(--primary-l); border-color:transparent">
          <p class="pre" style="margin:0">{{ respuesta() }}</p>
        </div>
      }
    </div>
  `,
})
export class TabIa {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();

  pregunta = '';
  respuesta = signal('');
  error = signal('');
  cargando = signal(false);

  async preguntar() {
    this.error.set('');
    this.respuesta.set('');
    this.cargando.set(true);
    try {
      const r = await this.api.preguntarIA(this.situacion().id_situacion, this.pregunta);
      this.respuesta.set(r.respuesta);
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
