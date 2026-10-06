import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_URL } from './config';
import {
  Alternativa, Analisis, Categoria, EntradaHistorial, Escenario, Factor, ItemChecklist,
  MiCamino, Situacion, SituacionDetalle,
} from './models';

// Extrae el mensaje de error que manda el backend ({ mensaje: '...' }).
export function mensajeError(e: any): string {
  if (e?.status === 0) return 'No se pudo conectar con el servidor. ¿Está encendido el backend?';
  return e?.error?.mensaje || 'Ocurrió un error inesperado';
}

// Todos los métodos devuelven Promesas, así se usan con async/await.
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  private get<T>(ruta: string, params?: Record<string, string | number>) {
    return firstValueFrom(this.http.get<T>(API_URL + ruta, { params }));
  }
  private post<T>(ruta: string, body: unknown = {}) {
    return firstValueFrom(this.http.post<T>(API_URL + ruta, body));
  }
  private put<T>(ruta: string, body: unknown = {}) {
    return firstValueFrom(this.http.put<T>(API_URL + ruta, body));
  }
  private del(ruta: string) {
    return firstValueFrom(this.http.delete<void>(API_URL + ruta));
  }

  // Catálogos
  categorias() { return this.get<Categoria[]>('/categorias'); }
  factores(idCategoria: number) { return this.get<Factor[]>('/factores', { categoria: idCategoria }); }

  // Situaciones
  crearSituacion(body: { id_categoria: number; titulo: string; descripcion: string }) {
    return this.post<Situacion>('/situaciones', body);
  }
  situacion(id: number) { return this.get<SituacionDetalle>(`/situaciones/${id}`); }
  eliminarSituacion(id: number) { return this.del(`/situaciones/${id}`); }
  guardarFactores(id: number, factores: { id_factor: number; valor: string }[]) {
    return this.put(`/situaciones/${id}/factores`, { factores });
  }
  preguntas(id: number) { return this.get<string[]>(`/situaciones/${id}/preguntas`); }

  // Alternativas
  alternativas(id: number) { return this.get<Alternativa[]>(`/situaciones/${id}/alternativas`); }
  crearAlternativa(id: number, body: unknown) { return this.post<Alternativa>(`/situaciones/${id}/alternativas`, body); }
  eliminarAlternativa(id: number, idAlt: number) { return this.del(`/situaciones/${id}/alternativas/${idAlt}`); }

  // Análisis
  analisis(id: number) { return this.get<Analisis[]>(`/situaciones/${id}/analisis`); }
  generarAnalisis(id: number) { return this.post<Analisis>(`/situaciones/${id}/analisis`); }

  // Checklist
  checklist(id: number) { return this.get<ItemChecklist[]>(`/situaciones/${id}/checklist`); }
  crearItem(id: number, item: string) { return this.post<ItemChecklist>(`/situaciones/${id}/checklist`, { item }); }
  generarChecklist(id: number) { return this.post<ItemChecklist[]>(`/situaciones/${id}/checklist/generar`); }
  marcarItem(id: number, idItem: number, completado: boolean) {
    return this.put<ItemChecklist>(`/situaciones/${id}/checklist/${idItem}`, { completado });
  }
  eliminarItem(id: number, idItem: number) { return this.del(`/situaciones/${id}/checklist/${idItem}`); }

  // Escenarios
  escenarios(id: number) { return this.get<Escenario[]>(`/situaciones/${id}/escenarios`); }
  crearEscenario(id: number, body: unknown) { return this.post<Escenario>(`/situaciones/${id}/escenarios`, body); }
  eliminarEscenario(id: number, idEsc: number) { return this.del(`/situaciones/${id}/escenarios/${idEsc}`); }

  // IA
  preguntarIA(id: number, pregunta: string) { return this.post<{ respuesta: string }>(`/situaciones/${id}/ia`, { pregunta }); }

  // Mi camino
  miCamino() { return this.get<MiCamino>('/mi-camino'); }
  historial() { return this.get<EntradaHistorial[]>('/historial'); }

  // Herramientas (no requieren sesión)
  comparar(body: unknown) { return this.post<any>('/herramientas/comparar', body); }
  salarioNeto(body: unknown) { return this.post<any>('/herramientas/salario-neto', body); }
  presupuesto(body: unknown) { return this.post<any>('/herramientas/presupuesto', body); }
  ahorro(body: unknown) { return this.post<any>('/herramientas/ahorro', body); }
}
