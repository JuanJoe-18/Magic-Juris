// Servicio de monitoreo y DETECCIÓN POR DIFERENCIA (RF-13/14/15/16).
// Compara las actuaciones de la fuente contra las ya almacenadas (por clave
// estable) y persiste solo las nuevas, actualizando el último estado conocido.
const prisma = require('../db')
const { fuente, FUENTE } = require('../sources')
const { clasificarLote } = require('./clasificacion')
const { anonimizar } = require('../lib/anonimizar')
const { esRadicadoValido } = require('../lib/radicado')
const { claveDe } = require('../lib/clave')
const { generarYGuardarResumenes } = require('./generadorResumenes')

async function monitorearProceso(proceso) {
  const fuenteData = await fuente.consultarPorRadicado(proceso.radicado)
  const actuaciones = fuenteData.actuaciones || []

  // Estado almacenado (línea base, RF-14).
  const existentes = await prisma.actuacion.findMany({
    where: { procesoId: proceso.id },
    select: { claveFuente: true, fecha: true, titulo: true, descripcion: true },
  })
  const yaVistas = new Set(existentes.map(claveDe))

  // Diferencia: lo que está en la fuente y no en la base (RF-15).
  const nuevas = actuaciones.filter((a) => !yaVistas.has(claveDe(a)))

  // Clasificación (RF-18/20). Anonimizamos la anotación antes de la IA (RF-25);
  // lo almacenado conserva el texto original.
  const nombres = [proceso.demandantes, proceso.demandados].filter(Boolean)
  const entrada = nuevas.map((a) => ({
    tipo: a.tipo,
    titulo: a.titulo,
    descripcion: anonimizar(a.descripcion, nombres),
  }))
  const clases = await clasificarLote(entrada)

  const creadas = []
  for (let i = 0; i < nuevas.length; i++) {
    const a = nuevas[i]
    const c = clases[i] || { criticidad: 'Informativa', estado: 'E1' }
    const creada = await prisma.actuacion.create({
      data: {
        procesoId: proceso.id,
        fecha: new Date(a.fecha),
        tipo: a.tipo || 'Actuación',
        titulo: a.titulo,
        descripcion: a.descripcion || '',
        criticidad: c.criticidad,
        estado: c.estado,
        documento: a.documento || null,
        claveFuente: claveDe(a),
        clasificadoPor: c.fuente || null,
        parte: c.parte || null,
        confianza: c.confianza ?? null,
        motivo: c.motivo || null,
        // detectadaEn = now() por defecto (RF-16)
      },
    })
    creadas.push(creada)

    // RF-21/22/25: Generar resúmenes por rol (asíncrono/fire-and-forget para no bloquear)
    generarYGuardarResumenes(creada, entrada[i].descripcion).catch(console.error)
  }

  // Actualizar último estado conocido (RF-14) — toma la actuación más reciente.
  const ordenadas = [...actuaciones].sort((x, y) => new Date(y.fecha) - new Date(x.fecha))
  const snapshot = {
    consultadoEn: new Date().toISOString(),
    fuente: FUENTE,
    total: actuaciones.length,
    ultimaClave: ordenadas.length ? claveDe(ordenadas[0]) : null,
  }
  await prisma.proceso.update({
    where: { id: proceso.id },
    data: {
      ultimoEstadoConocido: JSON.stringify(snapshot),
      ...(fuenteData.despacho ? { despacho: fuenteData.despacho } : {}),
      ...(fuenteData.demandantes ? { demandantes: fuenteData.demandantes } : {}),
      ...(fuenteData.demandados ? { demandados: fuenteData.demandados } : {}),
    },
  })

  return { radicado: proceso.radicado, nuevas: creadas.length, detalle: creadas }
}

// Consulta a demanda por radicado: exige que el proceso ya esté registrado
// por un abogado (RF-10, RNF-01) — nunca recolección masiva.
async function monitorearPorRadicado(radicado) {
  if (!esRadicadoValido(radicado)) {
    throw new Error(`Radicado inválido (deben ser 23 dígitos): ${radicado}`)
  }
  const proceso = await prisma.proceso.findUnique({ where: { radicado } })
  if (!proceso) {
    throw new Error(`Proceso no registrado (consulta a demanda, RF-10): ${radicado}`)
  }
  return monitorearProceso(proceso)
}

// Consulta con RESPALDO: si la fuente falla (Rama Judicial caída), devuelve el
// último estado conocido almacenado (RF-14 / RNF-12) en vez de fallar.
async function consultarProceso(radicado) {
  if (!esRadicadoValido(radicado)) {
    throw Object.assign(new Error('Radicado inválido (deben ser 23 dígitos).'), {
      code: 'INVALIDO',
    })
  }
  const proceso = await prisma.proceso.findUnique({ where: { radicado } })
  if (!proceso) {
    throw Object.assign(
      new Error('Proceso no registrado (consulta a demanda, RF-10).'),
      { code: 'NO_REGISTRADO' }
    )
  }
  try {
    const r = await monitorearProceso(proceso)
    return { nuevas: r.nuevas, desdeCache: false }
  } catch (e) {
    // Fuente no disponible → seguimos con lo persistido, sin romper la consulta.
    return { nuevas: 0, desdeCache: true, error: e.message }
  }
}

// Monitorea todos los procesos registrados (job programado, RF-13).
async function monitorearTodos() {
  const procesos = await prisma.proceso.findMany()
  const resultados = []
  for (const p of procesos) {
    try {
      resultados.push(await monitorearProceso(p))
    } catch (e) {
      resultados.push({ radicado: p.radicado, error: e.message })
    }
  }
  return resultados
}

module.exports = {
  monitorearProceso,
  monitorearPorRadicado,
  monitorearTodos,
  consultarProceso,
}
