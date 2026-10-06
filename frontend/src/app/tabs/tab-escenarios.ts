import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, mensajeError } from '../core/api.service';
import { Escenario, SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-escenarios',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <div class="card mb">
      <h2>¿Y si cambia algo?</h2>
      <p class="muted small">Simula cómo cambiaría tu saldo mensual si suben tus ingresos o tus gastos.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <label class="field"><span>Nombre del escenario</span><input [(ngModel)]="f.nombre" placeholder="Ej: Me suben el alquiler" /></label>
      <div class="grid g2">
        <label class="field"><span>Ingresos mensuales actuales (Q)</span><input type="number" [(ngModel)]="f.ingresos" /></label>
        <label class="field"><span>Gastos mensuales actuales (Q)</span><input type="number" [(ngModel)]="f.gastos" /></label>
        <label class="field"><span>Cambio en ingresos (%)</span><input type="number" [(ngModel)]="f.ingresos_pct" /></label>
        <label class="field"><span>Cambio en gastos (%)</span><input type="number" [(ngModel)]="f.gastos_pct" /></label>
        <label class="field"><span>Ingreso extra (Q)</span><input type="number" [(ngModel)]="f.ingresos_extra" /></label>
        <label class="field"><span>Gasto extra (Q)</span><input type="number" [(ngModel)]="f.gastos_extra" /></label>
      </div>
      <button class="btn btn-primary" (click)="crear()">Simular y guardar</button>
    </div>

    <div class="grid g2">
      @for (e of escenarios(); track e.id_escenario) {
        <div class="card">
          <div class="row between">
            <h3>{{ e.nombre }}</h3>
            <button class="btn btn-danger btn-sm" (click)="eliminar(e)">Quitar</button>
          </div>
          <p class="small" [class.best]="e.resultado.diferencia_saldo > 0">{{ e.resultado.interpretacion }}</p>
          <ul class="list">
            <li class="grow"><span class="muted">Saldo actual</span><b>{{ e.resultado.base.saldo | currency: 'GTQ' : 'Q' }}</b></li>
            <li class="grow"><span class="muted">Saldo en este escenario</span><b>{{ e.resultado.nuevo.saldo | currency: 'GTQ' : 'Q' }}</b></li>
          </ul>
        </div>
      }
    </div>
  `,
})
export class TabEscenarios implements OnInit {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();
  cambio = output<void>();

  escenarios = signal<Escenario[]>([]);
  error = signal('');
  f = {
    nombre: '', ingresos: null as number | null, gastos: null as number | null,
    ingresos_pct: null as number | null, gastos_pct: null as number | null,
    ingresos_extra: null as number | null, gastos_extra: null as number | null,
  };

  private get id() { return this.situacion().id_situacion; }

  async ngOnInit() { await this.cargar(); }

  async cargar() {
    try {
      this.escenarios.set(await this.api.escenarios(this.id));
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async crear() {
    this.error.set('');
    try {
      const { nombre, ingresos, gastos, ...cambios } = this.f;
      await this.api.crearEscenario(this.id, { nombre, base: { ingresos, gastos }, cambios });
      await this.cargar();
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async eliminar(e: Escenario) {
    try {
      await this.api.eliminarEscenario(this.id, e.id_escenario);
      await this.cargar();
    } catch (err) {
      this.error.set(mensajeError(err));
    }
  }
}
