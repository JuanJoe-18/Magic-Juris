// Métricas operativas de consulta a la fuente (RNF-15).
// Registra cada consulta (éxito/fallo, latencia, origen) y expone un resumen.
const prisma = require('../db')

async function registrarMetrica({ radicado, exito, latenciaMs, fuente, nuevas = 0, desdeCache = false, error = null }) {
  return prisma.metricaConsulta.create({
    data: {
      radicado: String(radicado),
      exito: Boolean(exito),
      latenciaMs: Math.max(0, Math.round(latenciaMs || 0)),
      fuente: fuente || 'desconocida',
      nuevas: nuevas || 0,
      desdeCache: Boolean(desdeCache),
      error: error || null,
    },
  })
}

// Resumen sobre las últimas N consultas: tasa de éxito, latencias y uso de caché.
async function resumenMetricas(limite = 500) {
  const filas = await prisma.metricaConsulta.findMany({
    orderBy: { creadoEn: 'desc' },
    take: limite,
  })
  const total = filas.length
  const exitosas = filas.filter((m) => m.exito).length
  const fallidas = total - exitosas
  const desdeCache = filas.filter((m) => m.desdeCache).length
  const lat = filas.map((m) => m.latenciaMs).sort((a, b) => a - b)
  const promedio = lat.length ? Math.round(lat.reduce((s, x) => s + x, 0) / lat.length) : 0
  const p95 = lat.length ? lat[Math.min(lat.length - 1, Math.floor(lat.length * 0.95))] : 0

  return {
    total,
    exitosas,
    fallidas,
    tasaExitoPct: total ? Math.round((exitosas / total) * 100) : 0,
    latenciaPromedioMs: promedio,
    latenciaP95Ms: p95,
    respuestasDesdeCache: desdeCache,
    ultima: filas[0]?.creadoEn || null,
  }
}

module.exports = { registrarMetrica, resumenMetricas }
