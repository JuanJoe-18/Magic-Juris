// Alertas proactivas temporales (RF-26 / criterio 4 del jurado).
// Recorre las actuaciones con una fecha de vencimiento futura y calcula los
// días restantes. Solo se reporta como alerta activa cuando los días restantes
// caen dentro de la ventana de antelación configurada para su criticidad.
const prisma = require('../db')

// Ventana de antelación por defecto (días) si no hay ConfigCriticidad en BD.
// Alineada con los ejemplos del reto: audiencia ~10 días, término ~3 días.
const ANTELACION_DEFAULT = {
  Critica: 10,
  Importante: 5,
  Informativa: 3,
}

function diasEntre(desde, hasta) {
  const ms = hasta.getTime() - desde.getTime()
  return Math.ceil(ms / 86400000)
}

async function obtenerAntelacion() {
  const cfg = await prisma.configCriticidad.findMany().catch(() => [])
  const mapa = { ...ANTELACION_DEFAULT }
  for (const c of cfg) {
    if (c?.nivel && typeof c.antelacionDias === 'number') mapa[c.nivel] = c.antelacionDias
  }
  return mapa
}

// Devuelve las alertas proactivas activas, ordenadas por urgencia (menos días primero).
async function alertasProximas() {
  const antelacion = await obtenerAntelacion()
  const hoy = new Date()

  const actuaciones = await prisma.actuacion.findMany({
    where: { fechaVencimiento: { gte: new Date(hoy.getTime() - 86400000) } },
    include: { proceso: true },
    orderBy: { fechaVencimiento: 'asc' },
  })

  const alertas = []
  for (const a of actuaciones) {
    const dias = diasEntre(hoy, a.fechaVencimiento)
    const ventana = antelacion[a.criticidad] ?? 5
    if (dias <= ventana) {
      alertas.push({
        actuacionId: a.id,
        radicado: a.proceso?.radicado || null,
        despacho: a.proceso?.despacho || null,
        titulo: a.titulo,
        tipoVencimiento: a.tipoVencimiento || 'diligencia',
        criticidad: a.criticidad,
        fechaVencimiento: a.fechaVencimiento,
        diasRestantes: dias,
        ventanaAntelacion: ventana,
        vencido: dias < 0,
      })
    }
  }

  // Orden final: más urgentes (menos días) primero.
  alertas.sort((x, y) => x.diasRestantes - y.diasRestantes)
  return alertas
}

module.exports = { alertasProximas }
