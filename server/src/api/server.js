// API HTTP del MVP (Express). Expone la consulta por radicado para el frontend.
// Módulo B (registro/consulta) lo extenderá con auth, registro y validación.
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const prisma = require('../db')
const { consultarProceso } = require('../services/monitoreo')
const { normalizarRadicado } = require('../lib/radicado')
const { procesarChat } = require('../services/chatbot')
const { enviarCorreo, plantillaResumen } = require('../services/email')
const { generarYGuardarResumenes } = require('../services/generadorResumenes')
const { anonimizar } = require('../lib/anonimizar')

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
    parte: a.parte,
    motivo: a.motivo,
    clasificadoPor: a.clasificadoPor,
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

// Chatbot endpoint multi-rol (MVP)
app.post('/api/chat', async (req, res) => {
  try {
    const { mensaje, historial, procesoId, rol } = req.body
    if (!mensaje) return res.status(400).json({ error: 'Mensaje es requerido' })
    const respuesta = await procesarChat(mensaje, historial || [], procesoId, rol)
    res.json({ respuesta })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Fuerza la generación del resumen IA a demanda.
app.post('/api/procesos/:radicado/generar-resumen', async (req, res) => {
  try {
    const radicado = normalizarRadicado(req.params.radicado)
    const proceso = await prisma.proceso.findUnique({
      where: { radicado },
      include: { actuaciones: { orderBy: { fecha: 'desc' }, take: 1 } },
    })
    if (!proceso) return res.status(404).json({ error: 'Proceso no registrado' })
    const ultima = proceso.actuaciones[0]
    if (!ultima) return res.status(400).json({ error: 'Consulta el proceso primero.' })

    const nombres = [proceso.demandantes, proceso.demandados].filter(Boolean)
    await generarYGuardarResumenes(ultima, anonimizar(ultima.descripcion, nombres))
    res.json({ success: true })
  } catch (e) {
    console.error('Error generando resumen:', e)
    let msg = e.message
    if (msg.includes('429 Too Many Requests') || msg.includes('quota')) {
      msg = 'Límite de cuota gratuita alcanzado en Google Gemini. Por favor espera unos 30 segundos y vuelve a intentarlo.'
    }
    res.status(500).json({ error: msg })
  }
})

// Envía el resumen IA al correo del cliente (genera el resumen si aún no existe).
app.post('/api/procesos/:radicado/enviar-resumen', async (req, res) => {
  try {
    const radicado = normalizarRadicado(req.params.radicado)
    const { email, rol = 'cliente' } = req.body || {}
    if (!email) return res.status(400).json({ error: 'Correo destinatario requerido' })

    const proceso = await prisma.proceso.findUnique({
      where: { radicado },
      include: { actuaciones: { orderBy: { fecha: 'desc' }, take: 1 } },
    })
    if (!proceso) return res.status(404).json({ error: 'Proceso no registrado' })
    const ultima = proceso.actuaciones[0]
    if (!ultima) {
      return res.status(400).json({ error: 'Consulta el proceso primero (sin actuaciones).' })
    }

    // Buscar el resumen; si no existe, generarlo a demanda (módulo E).
    const buscar = () =>
      prisma.resumen.findFirst({
        where: { rolDestino: rol, actuacion: { procesoId: proceso.id } },
        orderBy: { generadoEn: 'desc' },
      })
    let resumen = await buscar()
    if (!resumen) {
      const nombres = [proceso.demandantes, proceso.demandados].filter(Boolean)
      await generarYGuardarResumenes(ultima, anonimizar(ultima.descripcion, nombres))
      resumen = await buscar()
    }
    if (!resumen) {
      return res.status(502).json({ error: 'No se pudo generar el resumen (¿IA disponible?).' })
    }

    const r = await enviarCorreo({
      to: email,
      subject: `Actualización de su proceso — Radicado ${radicado}`,
      text: resumen.contenido,
      html: plantillaResumen({ radicado, contenido: resumen.contenido }),
    })

    // Trazabilidad (RF-30): registrar la comunicación.
    await prisma.comunicacion.create({
      data: {
        procesoId: proceso.id,
        resumenId: resumen.id,
        destinatario: email,
        canal: 'correo',
        estado: r.enviado ? 'entregado' : 'guardado',
      },
    })

    res.json({ ...r, destinatario: email, resumen: resumen.contenido })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ── Habeas Data (Ley 1581) — Módulo H ──

// RF-35 / RF-38: finalidad del tratamiento + base de legitimación por proceso.
app.get('/api/habeas/proceso/:radicado', async (req, res) => {
  const radicado = normalizarRadicado(req.params.radicado)
  const proceso = await prisma.proceso.findUnique({
    where: { radicado },
    include: { tratamiento: true },
  })
  if (!proceso) return res.status(404).json({ error: 'Proceso no registrado' })
  res.json({ radicado, tratamiento: proceso.tratamiento || null })
})

app.post('/api/habeas/proceso/:radicado', async (req, res) => {
  try {
    const radicado = normalizarRadicado(req.params.radicado)
    const { finalidad, baseLegitimacion } = req.body
    if (!finalidad || !baseLegitimacion) {
      return res.status(400).json({ error: 'Falta finalidad o baseLegitimacion' })
    }

    const proceso = await prisma.proceso.findUnique({ where: { radicado } })
    if (!proceso) return res.status(404).json({ error: 'Proceso no registrado' })

    const tratamiento = await prisma.tratamientoDatos.upsert({
      where: { procesoId: proceso.id },
      update: { finalidad, baseLegitimacion },
      create: { procesoId: proceso.id, finalidad, baseLegitimacion },
    })

    res.json({ radicado, tratamiento })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// RF-36: solicitudes ARCO (acceso / rectificación / supresión).
const TIPOS_ARCO = ['acceso', 'rectificacion', 'supresion']

app.get('/api/habeas/solicitudes', async (req, res) => {
  const solicitudes = await prisma.solicitudHabeas.findMany({
    include: { titular: { select: { nombre: true, email: true } } },
    orderBy: { creadoEn: 'desc' },
  })
  res.json(solicitudes)
})

app.post('/api/habeas/solicitudes', async (req, res) => {
  try {
    const { titularEmail, tipo } = req.body || {}
    if (!TIPOS_ARCO.includes(tipo)) {
      return res.status(400).json({ error: 'tipo inválido (acceso | rectificacion | supresion)' })
    }
    if (!titularEmail) return res.status(400).json({ error: 'titularEmail requerido' })

    const titular = await prisma.usuario.upsert({
      where: { email: titularEmail },
      update: {},
      create: {
        nombre: titularEmail.split('@')[0],
        email: titularEmail,
        passwordHash: 'habeas',
        rol: 'cliente',
      },
    })
    const solicitud = await prisma.solicitudHabeas.create({
      data: { titularId: titular.id, tipo },
      include: { titular: { select: { nombre: true, email: true } } },
    })
    res.status(201).json(solicitud)
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})

app.patch('/api/habeas/solicitudes/:id/resolver', async (req, res) => {
  try {
    const solicitud = await prisma.solicitudHabeas.update({
      where: { id: req.params.id },
      data: { estado: 'resuelta', resueltoEn: new Date() },
    })
    res.json(solicitud)
  } catch {
    res.status(404).json({ error: 'Solicitud no encontrada' })
  }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`API MagicJuris en http://localhost:${PORT}`))
