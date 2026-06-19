// Servicio de monitoreo y DETECCIÓN POR DIFERENCIA (RF-13/14/15/16).
// Compara las actuaciones de la fuente contra las ya almacenadas (por clave
// estable) y persiste solo las nuevas, actualizando el último estado conocido.
const prisma = require('../db')
const { fuente, FUENTE } = require('../sources')
const { clasificarActuacion } = require('./clasificacion')
const { esRadicadoValido } = require('../lib/radicado')
const { claveDe } = require('../lib/clave')

async function monitorearProceso(proceso) {
  const { actuaciones } = await fuente.consultarPorRadicado(proceso.radicado)

  // Estado almacenado (línea base, RF-14).
  const existentes = await prisma.actuacion.findMany({
    where: { procesoId: proceso.id },
    select: { claveFuente: true, fecha: true, titulo: true, descripcion: true },
  })
  const yaVistas = new Set(existentes.map(claveDe))

  // Diferencia: lo que está en la fuente y no en la base (RF-15).
  const nuevas = actuaciones.filter((a) => !yaVistas.has(claveDe(a)))

  const creadas = []
  for (const a of nuevas) {
    const { criticidad, estado } = clasificarActuacion(a) // stub Módulo D
    const creada = await prisma.actuacion.create({
      data: {
        procesoId: proceso.id,
        fecha: new Date(a.fecha),
        tipo: a.tipo || 'Actuación',
        titulo: a.titulo,
        descripcion: a.descripcion || '',
        criticidad,
        estado,
        documento: a.documento || null,
        claveFuente: claveDe(a),
        // detectadaEn = now() por defecto (RF-16)
      },
    })
    creadas.push(creada)
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
    data: { ultimoEstadoConocido: JSON.stringify(snapshot) },
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

module.exports = { monitorearProceso, monitorearPorRadicado, monitorearTodos }
