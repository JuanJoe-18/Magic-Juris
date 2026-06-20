// Cola de reintento de consultas (RNF-12).
// Cuando la fuente oficial falla tras agotar el backoff exponencial, el radicado
// se encola; un job lo reprocesa hasta completarse para no perder actuaciones.
const prisma = require('../db')

const MAX_INTENTOS = 6

// Encola (o reencola) un radicado pendiente, incrementando el contador de intentos.
async function encolar(radicado, error) {
  return prisma.colaReintento.upsert({
    where: { radicado: String(radicado) },
    update: { estado: 'pendiente', ultimoError: error || null, intentos: { increment: 1 } },
    create: { radicado: String(radicado), estado: 'pendiente', ultimoError: error || null, intentos: 1 },
  })
}

// Marca como completada si el radicado estaba en la cola (consulta exitosa).
async function marcarCompletada(radicado) {
  const existe = await prisma.colaReintento.findUnique({ where: { radicado: String(radicado) } })
  if (!existe || existe.estado === 'completada') return null
  return prisma.colaReintento.update({
    where: { radicado: String(radicado) },
    data: { estado: 'completada', ultimoError: null },
  })
}

// Marca como fallida definitiva (agotó MAX_INTENTOS).
async function marcarFallida(radicado, error) {
  return prisma.colaReintento.update({
    where: { radicado: String(radicado) },
    data: { estado: 'fallida', ultimoError: error || null },
  })
}

async function listarPendientes() {
  return prisma.colaReintento.findMany({ where: { estado: 'pendiente' }, orderBy: { creadoEn: 'asc' } })
}

module.exports = { encolar, marcarCompletada, marcarFallida, listarPendientes, MAX_INTENTOS }
