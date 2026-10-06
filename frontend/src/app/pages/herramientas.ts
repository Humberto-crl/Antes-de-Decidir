import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, mensajeError } from '../core/api.service';

type Herramienta = 'comparar' | 'salario' | 'presupuesto' | 'ahorro';

@Component({
  selector: 'page-herramientas',
  imports: [FormsModule, CurrencyPipe],
  template: `
    <h1>Herramientas</h1>
    <p class="muted">Calculadoras para entender los números antes de decidir. No necesitas cuenta.</p>

    <div class="tabs">
      @for (t of tabs; track t.id) {
        <button class="tab" [class.activo]="tab() === t.id" (click)="cambiar(t.id)">{{ t.nombre }}</button>
      }
    </div>
    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

    @switch (tab()) {

      @case ('comparar') {
        <div class="card mb">
          <h2>Comparador de ofertas</h2>
          <p class="muted small">Mayor salario no siempre significa más dinero ni mejor vida. Compara el ingreso real y el tiempo invertido.</p>
          <div class="grid g2">
            @for (a of alts; track $index) {
              <div class="card" style="background:var(--bg)">
                <div class="row between">
                  <input [(ngModel)]="a.nombre" style="font-weight:700" />
                  @if (alts.length > 2) { <button class="btn btn-ghost btn-sm" (click)="quitar($index)">✕</button> }
                </div>
                <div class="grid g2 mt">
                  <label class="field"><span>Salario (Q)</span><input type="number" [(ngModel)]="a.salario" /></label>
                  <label class="field"><span>Transporte al mes (Q)</span><input type="number" [(ngModel)]="a.transporte" /></label>
                  <label class="field"><span>Horas de trabajo al día</span><input type="number" [(ngModel)]="a.horas_trabajo" /></label>
                  <label class="field"><span>Horas de traslado al día</span><input type="number" [(ngModel)]="a.horas_traslado" /></label>
                </div>
                <label class="row small"><input type="checkbox" [(ngModel)]="a.permite_estudiar" /> Me permite seguir estudiando</label>
              </div>
            }
          </div>
          <div class="row mt">
            <button class="btn btn-primary" (click)="comparar()">Comparar</button>
            @if (alts.length < 5) { <button class="btn btn-ghost" (click)="agregar()">+ Agregar opción</button> }
          </div>
        </div>

        @if (resComparar(); as r) {
          <div class="card">
            <h2>Resultado</h2>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Opción</th><th>Salario</th><th>Ingreso real al mes</th><th>Horas/día</th><th>Q por hora</th><th>¿Estudia?</th></tr></thead>
                <tbody>
                  @for (x of r.alternativas; track x.nombre) {
                    <tr>
                      <td><b>{{ x.nombre }}</b></td>
                      <td [class.best]="x.nombre === r.destacados.mayor_salario_bruto">{{ x.salario_bruto | currency: 'GTQ' : 'Q' }}</td>
                      <td [class.best]="x.nombre === r.destacados.mayor_ingreso_neto">{{ x.ingreso_neto | currency: 'GTQ' : 'Q' }}</td>
                      <td [class.best]="x.nombre === r.destacados.menos_tiempo_diario">{{ x.horas_dia }}</td>
                      <td [class.best]="x.nombre === r.destacados.mejor_ingreso_por_hora">{{ x.ingreso_por_hora | currency: 'GTQ' : 'Q' }}</td>
                      <td>{{ x.permite_estudiar === null ? '—' : x.permite_estudiar ? 'Sí' : 'No' }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <p class="muted small mt">En verde: la mejor opción en cada columna.</p>
            <ul class="list">
              @for (o of r.observaciones; track $index) { <li>💡 {{ o }}</li> }
            </ul>
          </div>
        }
      }

      @case ('salario') {
        <div class="card mb">
          <h2>Salario real</h2>
          <p class="muted small">Descubre cuánto te queda de verdad después de descuentos y gastos de trabajar.</p>
          <div class="grid g3">
            <label class="field"><span>Salario mensual (Q)</span><input type="number" [(ngModel)]="s.salario" /></label>
            <label class="field"><span>Descuentos (%)</span><input type="number" [(ngModel)]="s.descuentos_pct" /><small>Ej: IGSS u otros. Confírmalo en tu contrato.</small></label>
            <label class="field"><span>Transporte al mes (Q)</span><input type="number" [(ngModel)]="s.transporte" /></label>
            <label class="field"><span>Otros gastos al mes (Q)</span><input type="number" [(ngModel)]="s.otros_gastos" /></label>
            <label class="field"><span>Horas de trabajo al día</span><input type="number" [(ngModel)]="s.horas_trabajo" /></label>
            <label class="field"><span>Horas de traslado al día</span><input type="number" [(ngModel)]="s.horas_traslado" /></label>
          </div>
          <button class="btn btn-primary" (click)="calcularSalario()">Calcular</button>
        </div>
        @if (resSalario(); as r) {
          <div class="grid g4">
            <div class="card"><div class="stat">{{ r.ingreso_neto | currency: 'GTQ' : 'Q' }}</div><div class="muted small">Te queda al mes</div></div>
            <div class="card"><div class="stat">{{ r.ingreso_por_hora | currency: 'GTQ' : 'Q' }}</div><div class="muted small">Por hora invertida</div></div>
            <div class="card"><div class="stat">{{ r.horas_dia }} h</div><div class="muted small">Tiempo diario total</div></div>
            <div class="card"><div class="stat">{{ r.descuentos | currency: 'GTQ' : 'Q' }}</div><div class="muted small">En descuentos</div></div>
          </div>
        }
      }

      @case ('presupuesto') {
        <div class="card mb">
          <h2>Presupuesto 50/30/20</h2>
          <p class="muted small">Como referencia: 50% necesidades, 30% deseos y 20% ahorro.</p>
          <label class="field" style="max-width:260px"><span>Ingresos mensuales (Q)</span><input type="number" [(ngModel)]="ingresos" /></label>
          <h3>Gastos</h3>
          @for (g of gastos; track $index) {
            <div class="row mb">
              <input style="flex:2; min-width:140px" [(ngModel)]="g.nombre" placeholder="Concepto" />
              <input style="flex:1; min-width:100px" type="number" [(ngModel)]="g.monto" placeholder="Monto" />
              <select style="flex:1; min-width:120px" [(ngModel)]="g.tipo">
                <option value="necesidad">Necesidad</option>
                <option value="deseo">Deseo</option>
                <option value="ahorro">Ahorro</option>
              </select>
              <button class="btn btn-ghost btn-sm" (click)="quitarGasto($index)">✕</button>
            </div>
          }
          <div class="row">
            <button class="btn btn-primary" (click)="calcularPresupuesto()">Calcular</button>
            <button class="btn btn-ghost" (click)="agregarGasto()">+ Agregar gasto</button>
          </div>
        </div>
        @if (resPresupuesto(); as r) {
          <div class="card">
            <div class="grid g3 mb">
              <div><div class="stat">{{ r.total_gastos | currency: 'GTQ' : 'Q' }}</div><div class="muted small">Gastos totales</div></div>
              <div><div class="stat" [class.best]="r.saldo >= 0" [style.color]="r.saldo < 0 ? 'var(--bad)' : ''">{{ r.saldo | currency: 'GTQ' : 'Q' }}</div><div class="muted small">Saldo del mes</div></div>
            </div>
            @for (b of barras(r); track b.nombre) {
              <div class="small row between"><span>{{ b.nombre }}</span><span>{{ b.valor }}% <span class="muted">(ref. {{ b.ref }}%)</span></span></div>
              <div class="bar mb"><span [style.width.%]="tope(b.valor)"></span></div>
            }
            <ul class="list">
              @for (o of r.observaciones; track $index) { <li>💡 {{ o }}</li> }
            </ul>
          </div>
        }
      }

      @case ('ahorro') {
        <div class="card mb">
          <h2>Meta de ahorro</h2>
          <p class="muted small">¿En cuánto tiempo llegas a tu meta?</p>
          <div class="grid g3">
            <label class="field"><span>Meta (Q)</span><input type="number" [(ngModel)]="a.meta" /></label>
            <label class="field"><span>Ahorro por mes (Q)</span><input type="number" [(ngModel)]="a.ahorro_mensual" /></label>
            <label class="field"><span>Ya tengo ahorrado (Q)</span><input type="number" [(ngModel)]="a.ahorro_actual" /></label>
          </div>
          <button class="btn btn-primary" (click)="calcularAhorro()">Calcular</button>
        </div>
        @if (resAhorro(); as r) {
          <div class="card">
            <div class="stat">{{ r.meses_necesarios }} meses</div>
            <p class="muted">{{ r.interpretacion }}</p>
          </div>
        }
      }
    }
  `,
})
export class HerramientasPage {
  private api = inject(ApiService);

  tab = signal<Herramienta>('comparar');
  error = signal('');
  tabs: { id: Herramienta; nombre: string }[] = [
    { id: 'comparar', nombre: '⚖️ Comparador' },
    { id: 'salario', nombre: '💵 Salario real' },
    { id: 'presupuesto', nombre: '📊 Presupuesto' },
    { id: 'ahorro', nombre: '🎯 Ahorro' },
  ];

  // Comparador (precargado con el ejemplo de la propuesta)
  alts = [
    { nombre: 'Oferta A', salario: 4500 as number | null, transporte: 500 as number | null, horas_trabajo: 8 as number | null, horas_traslado: 1 as number | null, permite_estudiar: true },
    { nombre: 'Oferta B', salario: 5200 as number | null, transporte: 1300 as number | null, horas_trabajo: 8 as number | null, horas_traslado: 3 as number | null, permite_estudiar: false },
  ];
  resComparar = signal<any>(null);

  // Salario real
  s = { salario: null as number | null, descuentos_pct: 0, transporte: 0, otros_gastos: 0, horas_trabajo: 8, horas_traslado: 0 };
  resSalario = signal<any>(null);

  // Presupuesto
  ingresos: number | null = 3000;
  gastos = [
    { nombre: 'Vivienda', monto: 1000 as number | null, tipo: 'necesidad' },
    { nombre: 'Comida y transporte', monto: 600 as number | null, tipo: 'necesidad' },
    { nombre: 'Salidas', monto: 500 as number | null, tipo: 'deseo' },
    { nombre: 'Fondo de emergencia', monto: 300 as number | null, tipo: 'ahorro' },
  ];
  resPresupuesto = signal<any>(null);

  // Ahorro
  a = { meta: null as number | null, ahorro_mensual: null as number | null, ahorro_actual: 0 as number | null };
  resAhorro = signal<any>(null);

  cambiar(t: Herramienta) { this.tab.set(t); this.error.set(''); }
  tope(n: number) { return Math.min(n, 100); }

  agregar() {
    if (this.alts.length < 5) {
      this.alts.push({ nombre: `Opción ${this.alts.length + 1}`, salario: null, transporte: 0, horas_trabajo: 8, horas_traslado: 0, permite_estudiar: true });
    }
  }
  quitar(i: number) { if (this.alts.length > 2) this.alts.splice(i, 1); }
  agregarGasto() { this.gastos.push({ nombre: '', monto: null, tipo: 'necesidad' }); }
  quitarGasto(i: number) { this.gastos.splice(i, 1); }

  barras(r: any) {
    return [
      { nombre: 'Necesidades', valor: r.porcentajes.necesidades, ref: r.referencia.necesidades },
      { nombre: 'Deseos', valor: r.porcentajes.deseos, ref: r.referencia.deseos },
      { nombre: 'Ahorro', valor: r.porcentajes.ahorro, ref: r.referencia.ahorro },
    ];
  }

  // Ejecuta la llamada al backend y guarda el resultado (o el error) en la pantalla.
  private async calcular(llamada: () => Promise<any>, destino: (r: any) => void) {
    this.error.set('');
    try {
      destino(await llamada());
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  comparar() { return this.calcular(() => this.api.comparar({ alternativas: this.alts }), (r) => this.resComparar.set(r)); }
  calcularSalario() { return this.calcular(() => this.api.salarioNeto(this.s), (r) => this.resSalario.set(r)); }
  calcularAhorro() { return this.calcular(() => this.api.ahorro(this.a), (r) => this.resAhorro.set(r)); }
  calcularPresupuesto() {
    return this.calcular(
      () => this.api.presupuesto({ ingresos: this.ingresos, gastos: this.gastos }),
      (r) => this.resPresupuesto.set(r)
    );
  }
}
