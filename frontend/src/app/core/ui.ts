export const ETIQUETA_ESTADO: Record<string, string> = {
  no_iniciado: 'No iniciado',
  pendiente: 'Pendiente',
  en_progreso: 'En progreso',
  completado: 'Completado',
};

const ICONOS: Record<string, string> = {
  'Trabajo': '💼',
  'Educación y carrera': '🎓',
  'Finanzas': '💰',
  'Independencia': '🏠',
  'Seguridad digital': '🛡️',
  'Vida cotidiana': '🧾',
};

export const icono = (categoria?: string) => (categoria && ICONOS[categoria]) || '📌';
