// Clave estable de una actuación para la DETECCIÓN POR DIFERENCIA (RF-15).
// - Fuente real: se usa idRegActuacion (id único del expediente).
// - Fuente simulada / seed: clave derivada de fecha + título + anotación
//   (incluye la anotación para distinguir actuaciones del mismo tipo y día).
function claveDerivada(a) {
  const fecha = (a.fecha instanceof Date ? a.fecha.toISOString() : String(a.fecha || '')).slice(0, 10)
  const titulo = (a.titulo || '').trim().toLowerCase()
  const desc = (a.descripcion || '').trim().toLowerCase()
  return `d:${fecha}|${titulo}|${desc}`
}

// Devuelve la clave de una actuación: la de la fuente si existe, o la derivada.
function claveDe(a) {
  return a.claveFuente || claveDerivada(a)
}

module.exports = { claveDerivada, claveDe }
