export interface Usuario { id_usuario: number; nombre: string; apellido: string; correo: string; }
export interface RespuestaAuth { usuario: Usuario; token: string; }

export interface Categoria { id_categoria: number; nombre: string; descripcion: string | null; }
export interface Factor { id_factor: number; id_categoria: number; nombre: string; descripcion: string | null; }

export type Estado = 'no_iniciado' | 'pendiente' | 'en_progreso' | 'completado';

export interface Situacion {
  id_situacion: number; id_categoria: number; titulo: string; descripcion: string | null;
  estado: Estado; progreso: number; fecha_creacion: string; categoria?: string;
}

export interface Alternativa {
  id_alternativa: number; nombre: string; descripcion: string | null;
  factores: { id_factor: number; factor: string; valor: string }[];
}
export interface ItemChecklist { id_checklist: number; item: string; completado: boolean; }
export interface Escenario { id_escenario: number; nombre: string; descripcion: string | null; variables: any; resultado: any; }

export interface SituacionDetalle extends Situacion {
  categoria: string;
  factores: { id_factor: number; nombre: string; descripcion: string | null; valor: string }[];
  alternativas: Alternativa[];
  escenarios: Escenario[];
  checklist: ItemChecklist[];
  ultimo_analisis: any | null;
}

export interface Analisis {
  id_analisis: number; cobertura?: number; fecha_analisis?: string;
  observaciones: string[]; informacion_faltante: string[];
}

export interface MiCamino {
  resumen: { total: number; no_iniciado: number; pendiente: number; en_progreso: number; completado: number };
  situaciones: (Situacion & { categoria: string })[];
}

export interface EntradaHistorial {
  id_historial: number; accion: string; fecha: string; id_situacion: number; titulo: string; categoria: string;
}
