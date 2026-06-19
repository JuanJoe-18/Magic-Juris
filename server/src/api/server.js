// API HTTP del MVP (Express). Expone la consulta por radicado para el frontend.
// Módulo B (registro/consulta) lo extenderá con auth, registro y validación.
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const prisma = require('../db')
const { consultarProceso } = require('../services/monitoreo')
const { normalizarRadicado } = require('../lib/radicado')

const app = express()
app.use(cors())
app.use(express.json())

function serializarActuacion(a) {
  return {
    id: a.id,
    fecha: a.fecha.toISOString().slice(0, 10),
    tipo: a.tipo,
    titulo: a.titulo,
    descripcion: a.descripcion,
    criticidad: a.criticidad,
    estado: a.estado,
    documento: a.documento,
    detectadaEn: a.detectadaEn,
  }
}

function serializarProceso(p) {
  return {
    id: p.id,
    radicado: p.radicado,
    cliente: p.cliente?.nombre,
    jurisdiccion: p.jurisdiccion,
    despacho: p.despacho,
    demandantes: p.demandantes,
    demandados: p.demandados,
    estado: p.estado,
    estadoLabel: p.estadoLabel,
    sincronizadoEn: (() => {
      try {
        return JSON.parse(p.ultimoEstadoConocido || '{}').consultadoEn || null
      } catch {
        return null
      }
    })(),
  }
}

// Resúmenes IA más recientes del proceso (por rol). Módulo E los generará en vivo.
async function obtenerResumenes(procesoId) {
  const [abogado, cliente] = await Promise.all([
    prisma.resumen.findFirst({
      where: { rolDestino: 'abogado', actuacion: { procesoId } },
      orderBy: { generadoEn: 'desc' },
    }),
    prisma.resumen.findFirst({
      where: { rolDestino: 'cliente', actuacion: { procesoId } },
      orderBy: { generadoEn: 'desc' },
    }),
  ])
  return { abogado: abogado?.contenido || null, cliente: cliente?.contenido || null }
}

app.get('/api/health', (req, res) => res.json({ ok: true }))

// Lista de procesos (para sugerencias del buscador).
app.get('/api/procesos', async (req, res) => {
  const procesos = await prisma.proceso.findMany({
    include: { cliente: { select: { nombre: true } } },
    orderBy: { creadoEn: 'asc' },
  })
  res.json(procesos.map(serializarProceso))
})

// Detalle de un proceso + sus actuaciones almacenadas.
app.get('/api/procesos/:radicado', async (req, res) => {
  const radicado = normalizarRadicado(req.params.radicado)
  const proceso = await prisma.proceso.findUnique({
    where: { radicado },
    include: {
      cliente: { select: { nombre: true } },
      actuaciones: { orderBy: { fecha: 'desc' } },
    },
  })
  if (!proceso) return res.status(404).json({ error: 'Proceso no registrado' })
  res.json({
    proceso: serializarProceso(proceso),
    actuaciones: proceso.actuaciones.map(serializarActuacion),
    resumenes: await obtenerResumenes(proceso.id),
  })
})

// Consulta a demanda: dispara el monitoreo (RF-10/13/15) y devuelve el resultado.
app.post('/api/procesos/:radicado/consultar', async (req, res) => {
  try {
    const radicado = normalizarRadicado(req.params.radicado)
    const r = await consultarProceso(radicado) // con respaldo si la RJ se cae
    const proceso = await prisma.proceso.findUnique({
      where: { radicado },
      include: {
        cliente: { select: { nombre: true } },
        actuaciones: { orderBy: { fecha: 'desc' } },
      },
    })
    res.json({
      radicado,
      nuevas: r.nuevas,
      desdeCache: r.desdeCache,
      proceso: serializarProceso(proceso),
      actuaciones: proceso.actuaciones.map(serializarActuacion),
      resumenes: await obtenerResumenes(proceso.id),
    })
  } catch (e) {
    if (e.code === 'NO_REGISTRADO') return res.status(404).json({ error: e.message })
    res.status(400).json({ error: e.message })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API MagicJuris en http://localhost:${PORT}`))
