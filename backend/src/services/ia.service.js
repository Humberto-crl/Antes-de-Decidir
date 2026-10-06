const HttpError = require('../utils/httpError');
const { textoOpcional } = require('../utils/validar');
const situaciones = require('./situaciones.service');

const SYSTEM = `Eres el asistente de "Antes de Decidir", una plataforma para jóvenes de 17 a 22 años \
que están por tomar una decisión importante (trabajo, estudios, finanzas, independencia, seguridad digital).
Reglas: NO decides por el usuario ni dices "haz esto". Ayudas a ver mejor: explica qué significan los datos, \
señala factores que podría estar pasando por alto, indica qué información falta y sugiere preguntas \
que debería hacer. Usa lenguaje claro y cercano, en español, máximo 250 palabras. Los montos están en quetzales (Q).`;

function armarContexto(d) {
  const lineas = [
    `Situación: ${d.titulo} (categoría: ${d.categoria})`,
    `Descripción: ${d.descripcion || 'sin descripción'}`,
    'Factores indicados: ' + (d.factores.length ? d.factores.map((f) => `${f.nombre}=${f.valor}`).join('; ') : 'ninguno'),
  ];
  d.alternativas.forEach((a) => {
    lineas.push(`Alternativa "${a.nombre}": ` + (a.factores.map((f) => `${f.factor}=${f.valor}`).join('; ') || 'sin datos'));
  });
  if (d.ultimo_analisis) {
    lineas.push(`Último análisis - observaciones: ${d.ultimo_analisis.observaciones || '-'}`);
    lineas.push(`Último análisis - información faltante: ${d.ultimo_analisis.informacion_faltante || '-'}`);
  }
  return lineas.join('\n');
}

async function interpretar(idSituacion, idUsuario, datos = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new HttpError(503, 'La IA no está configurada en el servidor (falta ANTHROPIC_API_KEY)');

  const detalle = await situaciones.obtenerDetalle(idSituacion, idUsuario);
  const pregunta = textoOpcional(datos.pregunta, 500) || 'Ayúdame a entender mi situación antes de decidir.';

  const respuesta = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || 'claude-sonnet-5-5',
      max_tokens: 800,
      system: SYSTEM,
      messages: [{ role: 'user', content: `${armarContexto(detalle)}\n\nPregunta del usuario: ${pregunta}` }],
    }),
  });

  if (!respuesta.ok) {
    console.error('Error de la API de IA:', respuesta.status, await respuesta.text());
    throw new HttpError(502, 'La IA no pudo responder en este momento');
  }
  const data = await respuesta.json();
  const texto = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  return { respuesta: texto };
}

module.exports = { interpretar };
