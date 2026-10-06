import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApiService, mensajeError } from '../core/api.service';
import { Analisis, SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-analisis',
  imports: [DatePipe],
  template: `
    <div class="card mb">
      <div class="row between">
        <div>
          <h2>Análisis</h2>
          <p class="muted small">Revisa qué has completado, qué te falta y en qué se diferencian tus alternativas.</p>
        </div>
        <button class="btn btn-primary" [disabled]="cargando()" (click)="analizar()">
          {{ cargando() ? 'Analizando...' : '🔎 Analizar ahora' }}
        </button>
      </div>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      @if (actual(); as a) {
        @if (a.cobertura !== undefined) {
          <div class="muted small">Información completada</div>
          <div class="bar" [class.ok]="a.cobertura === 100"><span [style.width.%]="a.cobertura"></span></div>
          <div class="small" style="margin:.3rem 0 1rem">{{ a.cobertura }}%</div>
        }
        @if (a.fecha_analisis) {
          <p class="muted small">Último análisis: {{ a.fecha_analisis | date: 'dd/MM/yyyy HH:mm' }}</p>
        }

        <h3>Observaciones</h3>
        <ul class="list">
          @for (o of a.observaciones; track $index) { <li>💡 {{ o }}</li> }
        </ul>

        <h3 class="mt">Información que te falta</h3>
        @if (a.informacion_faltante.length === 0) {
          <div class="alert alert-ok">¡Tienes toda la información clave!</div>
        } @else {
          <ul class="list">
            @for (f of a.informacion_faltante; track $index) { <li>⚠️ {{ f }}</li> }
          </ul>
        }
      } @else {
        <div class="empty">Aún no has analizado esta situación. Pulsa "Analizar ahora".</div>
      }
    </div>

    <div class="card">
      <h3>Preguntas que conviene hacerte</h3>
      <ul class="list">
        @for (p of preguntas(); track $index) { <li>❓ {{ p }}</li> }
      </ul>
    </div>
  `,
})
export class TabAnalisis implements OnInit {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();
  cambio = output<void>();

  actual = signal<Analisis | null>(null);
  preguntas = signal<string[]>([]);
  cargando = signal(false);
  error = signal('');

  async ngOnInit() {
    const id = this.situacion().id_situacion;
    try {
      const [historial, preguntas] = await Promise.all([this.api.analisis(id), this.api.preguntas(id)]);
      this.actual.set(historial[0] ?? null);
      this.preguntas.set(preguntas);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async analizar() {
    this.error.set('');
    this.cargando.set(true);
    try {
      this.actual.set(await this.api.generarAnalisis(this.situacion().id_situacion));
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.cargando.set(false);
    }
  }
}
