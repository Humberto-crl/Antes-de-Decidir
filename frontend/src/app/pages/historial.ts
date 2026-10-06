import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, mensajeError } from '../core/api.service';
import { EntradaHistorial } from '../core/models';
import { icono } from '../core/ui';

@Component({
  selector: 'page-historial',
  imports: [RouterLink, DatePipe],
  template: `
    <h1>Historial</h1>
    <p class="muted">Lo que has hecho con tus situaciones.</p>
    @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

    <div class="card">
      <ul class="list">
        @for (h of items(); track h.id_historial) {
          <li class="grow">
            <span>{{ icono(h.categoria) }}
              <b>{{ h.accion === 'analizada' ? 'Analizaste' : 'Creaste' }}</b>
              <a [routerLink]="['/situacion', h.id_situacion]"> {{ h.titulo }}</a>
            </span>
            <span class="muted small">{{ h.fecha | date: 'dd/MM/yyyy HH:mm' }}</span>
          </li>
        } @empty {
          <li class="empty" style="display:block; width:100%">Todavía no hay actividad.</li>
        }
      </ul>
    </div>
  `,
})
export class HistorialPage implements OnInit {
  private api = inject(ApiService);
  items = signal<EntradaHistorial[]>([]);
  error = signal('');
  icono = icono;

  async ngOnInit() {
    try {
      this.items.set(await this.api.historial());
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }
}
