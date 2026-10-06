import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, mensajeError } from '../core/api.service';
import { Categoria } from '../core/models';

@Component({
  selector: 'page-nueva',
  imports: [FormsModule],
  template: `
    <div class="card" style="max-width:640px; margin:0 auto">
      <h2>Nueva situación</h2>
      <p class="muted small">Cuéntanos qué decisión tienes por delante. Puedes ajustar todo después.</p>
      @if (error()) { <div class="alert alert-error">{{ error() }}</div> }

      <label class="field"><span>Categoría</span>
        <select [(ngModel)]="idCategoria">
          <option [ngValue]="null" disabled>Selecciona una categoría</option>
          @for (c of categorias(); track c.id_categoria) {
            <option [ngValue]="c.id_categoria">{{ c.nombre }}</option>
          }
        </select>
      </label>
      <label class="field"><span>Título</span>
        <input [(ngModel)]="titulo" maxlength="150" placeholder="Ej: Dos ofertas de trabajo, ¿cuál elegir?" />
      </label>
      <label class="field"><span>Descripción</span>
        <textarea [(ngModel)]="descripcion" placeholder="¿Qué pasó? ¿Qué opciones tienes? ¿Hay plazos?"></textarea>
        <small>Mientras más contexto des, mejor será el análisis.</small>
      </label>
      <button class="btn btn-primary" [disabled]="guardando()" (click)="guardar()">
        {{ guardando() ? 'Guardando...' : 'Crear y continuar' }}
      </button>
    </div>
  `,
})
export class NuevaSituacionPage implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  categorias = signal<Categoria[]>([]);
  error = signal('');
  guardando = signal(false);
  idCategoria: number | null = null;
  titulo = '';
  descripcion = '';

  async ngOnInit() {
    const previa = Number(this.route.snapshot.queryParamMap.get('categoria'));
    if (previa) this.idCategoria = previa;
    try {
      this.categorias.set(await this.api.categorias());
    } catch (e) {
      this.error.set(mensajeError(e));
    }
  }

  async guardar() {
    if (!this.idCategoria) { this.error.set('Selecciona una categoría'); return; }
    this.error.set('');
    this.guardando.set(true);
    try {
      const s = await this.api.crearSituacion({
        id_categoria: this.idCategoria, titulo: this.titulo, descripcion: this.descripcion,
      });
      this.router.navigate(['/situacion', s.id_situacion]);
    } catch (e) {
      this.error.set(mensajeError(e));
    } finally {
      this.guardando.set(false);
    }
  }
}
