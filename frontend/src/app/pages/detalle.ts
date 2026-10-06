import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, mensajeError } from '../core/api.service';
import { SituacionDetalle } from '../core/models';
import { ETIQUETA_ESTADO, icono } from '../core/ui';
import { TabFactores } from '../tabs/tab-factores';
import { TabAlternativas } from '../tabs/tab-alternativas';
import { TabChecklist } from '../tabs/tab-checklist';
import { TabAnalisis } from '../tabs/tab-analisis';
import { TabEscenarios } from '../tabs/tab-escenarios';
import { TabIa } from '../tabs/tab-ia';

type Pestana = 'factores' | 'alternativas' | 'analisis' | 'checklist' | 'escenarios' | 'ia';

@Component({
  selector: 'page-detalle',
  imports: [TabFactores, TabAlternativas, TabChecklist, TabAnalisis, TabEscenarios, TabIa],
  template: `
    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

    @if (det(); as d) {
      <div class="card">
        <div class="row between">
          <span class="muted small">{{ icono(d.categoria) }} {{ d.categoria }}</span>
          <span [class]="'badge est-' + d.estado">{{ etiqueta[d.estado] }}</span>
        </div>
        <h1 style="margin-top:.4rem">{{ d.titulo }}</h1>
        @if (d.descripcion) { <p class="muted pre">{{ d.descripcion }}</p> }

        <div class="bar" [class.ok]="d.progreso === 100"><span [style.width.%]="d.progreso"></span></div>
        <div class="row between" style="margin-top:.4rem">
          <span class="muted small">
            {{ d.progreso }}% · {{ d.factores.length }} factores · {{ d.alternativas.length }} alternativas
            · {{ completados(d) }}/{{ d.checklist.length }} pasos
          </span>
          <button class="btn btn-danger btn-sm" (click)="eliminar()">Eliminar</button>
        </div>
      </div>

      <div class="tabs">
        @for (t of pestanas; track t.id) {
          <button class="tab" [class.activo]="tab() === t.id" (click)="tab.set(t.id)">{{ t.nombre }}</button>
        }
      </div>

      @switch (tab()) {
        @case ('factores') { <tab-factores [situacion]="d" (cambio)="cargar()" /> }
        @case ('alternativas') { <tab-alternativas [situacion]="d" (cambio)="cargar()" /> }
        @case ('analisis') { <tab-analisis [situacion]="d" (cambio)="cargar()" /> }
        @case ('checklist') { <tab-checklist [situacion]="d" (cambio)="cargar()" /> }
        @case ('escenarios') { <tab-escenarios [situacion]="d" (cambio)="cargar()" /> }
        @case ('ia') { <tab-ia [situacion]="d" /> }
      }
    }
  `,
})
export class DetallePage implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id = Number(this.route.snapshot.paramMap.get('id'));
  det = signal<SituacionDetalle | null>(null);
  error = signal('');
  tab = signal<Pestana>('factores');
  etiqueta = ETIQUETA_ESTADO;
  icono = icono;

  pestanas: { id: Pestana; nombre: string }[] = [
    { id: 'factores', nombre: '🧩 Factores' },
    { id: 'alternativas', nombre: '⚖️ Alternativas' },
    { id: 'analisis', nombre: '🔎 Análisis' },
    { id: 'checklist', nombre: '✅ Checklist' },
    { id: 'escenarios', nombre: '🔮 Escenarios' },
    { id: 'ia', nombre: '🤖 Asistente' },
  ];

  ngOnInit() { return this.cargar(); }

  completados(d: SituacionDetalle) { return d.checklist.filter((i) => i.completado).length; }

  async cargar() {
    try {
      this.det.set(await this.api.situacion(this.id));
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async eliminar() {
    if (!confirm('¿Eliminar esta situación y todo su análisis? No se puede deshacer.')) return;
    try {
      await this.api.eliminarSituacion(this.id);
      this.router.navigate(['/mi-camino']);
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
