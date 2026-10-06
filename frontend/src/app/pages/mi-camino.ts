import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ApiService, mensajeError } from '../core/api.service';
import { MiCamino } from '../core/models';
import { ETIQUETA_ESTADO, icono } from '../core/ui';

@Component({
  selector: 'page-mi-camino',
  imports: [RouterLink],
  template: `
    <div class="row between mb">
      <div>
        <h1>Mi camino</h1>
        <p class="muted">Todas tus situaciones y cuánto has avanzado en cada una.</p>
      </div>
      <a class="btn btn-primary" routerLink="/nueva">+ Nueva situación</a>
    </div>

    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

    @if (data(); as d) {
      <div class="grid g4 mb">
        <div class="card"><div class="stat">{{ d.resumen.total }}</div><div class="muted small">Situaciones</div></div>
        <div class="card"><div class="stat">{{ d.resumen.en_progreso }}</div><div class="muted small">En progreso</div></div>
        <div class="card"><div class="stat">{{ d.resumen.pendiente + d.resumen.no_iniciado }}</div><div class="muted small">Pendientes</div></div>
        <div class="card"><div class="stat">{{ d.resumen.completado }}</div><div class="muted small">Completadas</div></div>
      </div>

      <div class="grid g2">
        @for (s of d.situaciones; track s.id_situacion) {
          <a class="card link-card" [routerLink]="['/situacion', s.id_situacion]">
            <div class="row between">
              <span class="muted small">{{ icono(s.categoria) }} {{ s.categoria }}</span>
              <span [class]="'badge est-' + s.estado">{{ etiqueta[s.estado] }}</span>
            </div>
            <h3 style="margin-top:.5rem">{{ s.titulo }}</h3>
            <div class="bar" [class.ok]="s.progreso === 100"><span [style.width.%]="s.progreso"></span></div>
            <div class="muted small" style="margin-top:.35rem">{{ s.progreso }}% completado</div>
          </a>
        } @empty {
          <div class="card empty" style="grid-column: 1 / -1">
            <div class="emoji">🧭</div>
            <p>Aún no tienes situaciones. Crea la primera para empezar a analizarla.</p>
            <a class="btn btn-primary" routerLink="/nueva">Crear situación</a>
          </div>
        }
      </div>
    }
  `,
})
export class MiCaminoPage implements OnInit {
  private api = inject(ApiService);
  data = signal<MiCamino | null>(null);
  error = signal('');
  etiqueta = ETIQUETA_ESTADO;
  icono = icono;

  async ngOnInit() {
    try {
      this.data.set(await this.api.miCamino());
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
