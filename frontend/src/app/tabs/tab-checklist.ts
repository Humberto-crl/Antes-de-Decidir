import { Component, OnInit, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService, mensajeError } from '../core/api.service';
import { ItemChecklist, SituacionDetalle } from '../core/models';

@Component({
  selector: 'tab-checklist',
  imports: [FormsModule],
  template: `
    <div class="card">
      <div class="row between">
        <div>
          <h2>Checklist</h2>
          <p class="muted small">Pasos para revisar antes de actuar. Tu progreso se calcula con lo que marques.</p>
        </div>
        <button class="btn btn-ghost btn-sm" (click)="generar()">✨ Sugerir pasos</button>
      </div>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <ul class="list">
        @for (i of items(); track i.id_checklist) {
          <li class="grow">
            <input type="checkbox" [checked]="i.completado" (change)="marcar(i)" />
            <span [class.done]="i.completado">{{ i.item }}</span>
            <button class="btn btn-ghost btn-sm" (click)="eliminar(i)">✕</button>
          </li>
        } @empty {
          <li class="muted">Aún no hay pasos. Usa "Sugerir pasos" o agrega el tuyo.</li>
        }
      </ul>

      <div class="row mt">
        <input style="flex:1" [(ngModel)]="nuevo" placeholder="Agregar un paso..." (keyup.enter)="agregar()" />
        <button class="btn btn-primary" (click)="agregar()">Agregar</button>
      </div>
    </div>
  `,
})
export class TabChecklist implements OnInit {
  private api = inject(ApiService);
  situacion = input.required<SituacionDetalle>();
  cambio = output<void>();

  items = signal<ItemChecklist[]>([]);
  error = signal('');
  nuevo = '';

  private get id() { return this.situacion().id_situacion; }

  async ngOnInit() { await this.cargar(); }

  async cargar() {
    try {
      this.items.set(await this.api.checklist(this.id));
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  // Ejecuta una acción, recarga la lista y avisa a la página para actualizar el progreso.
  private async ejecutar(accion: () => Promise<unknown>) {
    this.error.set('');
    try {
      await accion();
      await this.cargar();
      this.cambio.emit();
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  marcar(i: ItemChecklist) { return this.ejecutar(() => this.api.marcarItem(this.id, i.id_checklist, !i.completado)); }
  eliminar(i: ItemChecklist) { return this.ejecutar(() => this.api.eliminarItem(this.id, i.id_checklist)); }
  generar() { return this.ejecutar(() => this.api.generarChecklist(this.id)); }

  async agregar() {
    if (!this.nuevo.trim()) return;
    const texto = this.nuevo;
    this.nuevo = '';
    await this.ejecutar(() => this.api.crearItem(this.id, texto));
  }
}
