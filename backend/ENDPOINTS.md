# API Antes de Decidir — Guía de endpoints

Base: `http://localhost:3000/api`
🔒 = requiere header `Authorization: Bearer <token>` (el token se obtiene en registro/login).
Errores siempre vienen como `{ "mensaje": "..." }` con el código HTTP correspondiente.

## Auth
| Método | Ruta | Body |
|---|---|---|
| POST | /auth/registro | `{nombre, apellido, correo, password(min 8)}` → `{usuario, token}` |
| POST | /auth/login | `{correo, password}` → `{usuario, token}` |
| GET 🔒 | /auth/perfil | — |

## Catálogos
| Método | Ruta | Notas |
|---|---|---|
| GET | /categorias, /categorias/:id | público |
| POST/PUT/DELETE 🔒 | /categorias, /categorias/:id | `{nombre, descripcion}` |
| GET | /factores?categoria=ID | factores de una categoría (público) |
| POST/PUT/DELETE 🔒 | /factores, /factores/:id | `{id_categoria, nombre, descripcion}` |

## Situaciones 🔒 (cada usuario solo ve las suyas)
| Método | Ruta | Descripción |
|---|---|---|
| GET | /situaciones?categoria=&estado= | lista |
| POST | /situaciones | `{id_categoria, titulo, descripcion}` |
| GET | /situaciones/:id | detalle completo (factores, alternativas, escenarios, checklist, último análisis) |
| PUT | /situaciones/:id | `{titulo?, descripcion?, id_categoria?, estado?}` |
| DELETE | /situaciones/:id | borra todo lo relacionado |
| PUT | /situaciones/:id/factores | `{factores:[{id_factor, valor}]}` reemplaza todos |
| GET | /situaciones/:id/resumen | datos para el panel de resultados |
| GET | /situaciones/:id/preguntas | preguntas recomendadas según categoría |

### Alternativas — /situaciones/:id/alternativas
GET · POST `{nombre, descripcion, factores:[{id_factor, valor}]}` · PUT /:idAlt (igual; si envías `factores` se reemplazan) · DELETE /:idAlt

### Análisis — /situaciones/:id/analisis
POST (genera análisis: `{cobertura, observaciones[], informacion_faltante[]}`) · GET (historial de análisis)

### Checklist — /situaciones/:id/checklist
GET · POST `{item}` · POST /generar (crea los sugeridos de la categoría) · PUT /:idItem `{item?, completado?: true|false}` · DELETE /:idItem
(El progreso y estado de la situación se recalculan solos.)

### Escenarios — /situaciones/:id/escenarios
GET · POST `{nombre, descripcion, base:{ingresos, gastos}, cambios:{ingresos_pct?, gastos_pct?, ingresos_extra?, gastos_extra?}}` · DELETE /:idEsc

### IA — POST /situaciones/:id/ia
`{pregunta?}` → `{respuesta}`. Requiere `ANTHROPIC_API_KEY` en el servidor.

## Mi camino 🔒
GET /mi-camino → `{resumen, situaciones}` · GET /historial

## Herramientas (públicas, sin base de datos)
| POST | Body |
|---|---|
| /herramientas/salario-neto | `{salario, descuentos_pct?, transporte?, otros_gastos?, horas_trabajo?(8), horas_traslado?(0), dias_mes?(22)}` |
| /herramientas/comparar | `{alternativas:[{nombre, salario, transporte, horas_trabajo, horas_traslado, permite_estudiar?, experiencia?: baja|media|alta}]}` (2 a 5) |
| /herramientas/presupuesto | `{ingresos, gastos:[{nombre, monto, tipo?: necesidad|deseo|ahorro}]}` |
| /herramientas/ahorro | `{meta, ahorro_mensual, ahorro_actual?}` |
| /herramientas/escenarios | `{base:{ingresos, gastos}, escenarios:[{nombre, cambios:{...}}]}` |
