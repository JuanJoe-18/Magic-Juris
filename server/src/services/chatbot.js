const { executeWithFallback } = require('./aiFallback')
const prisma = require('../db')
const { anonimizar } = require('../lib/anonimizar')

// Extrae el contexto del proceso desde la DB dependiendo del rol (RAG)
async function construirContextoRAG(procesoId, rol) {
  if (procesoId === null || procesoId === undefined || procesoId === '')
    return 'No hay contexto de un proceso específico.'

  // El frontend puede pasar el radicado (común a ambos backends) o un id.
  // El id de Proceso en Node es un String (cuid); Python usa enteros, así que
  // buscamos primero por radicado y, si no, por id (siempre como String).
  const ref = String(procesoId).trim()
  const incluir = { actuaciones: { orderBy: { fecha: 'desc' }, take: 5 } }

  let proceso = null
  try {
    if (/^\d{18,23}$/.test(ref)) {
      proceso = await prisma.proceso.findFirst({ where: { radicado: ref }, include: incluir })
    } else {
      proceso = await prisma.proceso.findUnique({ where: { id: ref }, include: incluir })
    }
  } catch (e) {
    console.warn('RAG: no se pudo cargar el proceso:', e.message)
    return 'No hay contexto de un proceso específico.'
  }

  if (!proceso) return 'No hay contexto de un proceso específico en seguimiento por la IA.'

  const nombres = [proceso.demandantes, proceso.demandados].filter(Boolean)
  let contextoStr = `DATOS DEL PROCESO:\nRadicado: ${proceso.radicado}\nDespacho: ${proceso.despacho}\nEstado General: ${proceso.estadoLabel}\n\n`

  if (rol === 'abogado') {
    contextoStr += `ÚLTIMAS ACTUACIONES DEL EXPEDIENTE (crudo anonimizado):\n`
    for (const a of proceso.actuaciones) {
      const descSegura = anonimizar(a.descripcion, nombres)
      contextoStr += `- Fecha: ${a.fecha.toISOString().slice(0, 10)} | Tipo: ${a.tipo} | Título: ${a.titulo} | Etapa Asignada: ${a.estado}\n  Texto: ${descSegura}\n`
    }
  } else if (rol === 'cliente') {
    contextoStr += `ÚLTIMAS ACTUALIZACIONES PARA EL CLIENTE:\n`
    // Buscar los resúmenes de cliente para estas actuaciones
    const resumenes = await prisma.resumen.findMany({
      where: { actuacionId: { in: proceso.actuaciones.map(a => a.id) }, rolDestino: 'cliente' },
    })
    
    for (const a of proceso.actuaciones) {
      const res = resumenes.find(r => r.actuacionId === a.id)
      contextoStr += `- Fecha: ${a.fecha.toISOString().slice(0, 10)} | Actuación: ${a.titulo}\n`
      if (res) contextoStr += `  Explicación: ${res.contenido}\n`
    }
  }

  return contextoStr
}

// Configura el prompt del sistema dependiendo del rol
function obtenerInstruccionSistema(rol) {
  if (rol === 'abogado') {
    return `Eres el asistente técnico-jurídico IA de Hurtado Gandini Abogados.
Tu usuario es un ABOGADO de la firma.
Tus funciones principales:
1. Analizar contexto de expedientes procesales.
2. Calcular términos de ley (CGP, CPTSS, CPACA).
3. Redactar borradores de memoriales (recursos, contestaciones) basados estrictamente en las actuaciones detectadas.
Mantén un tono profesional, técnico y directo. Si se te pide un borrador, usa estructura formal de memorial en Colombia.`
  }
  if (rol === 'cliente') {
    return `Eres el asistente de servicio al cliente de Hurtado Gandini Abogados.
Tu usuario es el CLIENTE titular del proceso.
Tus funciones principales:
1. Explicar el estado de su caso sin jerga jurídica.
2. Calmar ansiedades y dar respuestas empáticas.
3. Aclarar si el cliente debe hacer algo o si el equipo de abogados ya se está encargando.
Si te preguntan por términos complejos (ej. "medidas cautelares"), explícalo con una analogía sencilla.`
  }
  if (rol === 'admin') {
    return `Eres el asistente de inteligencia de negocios (BI) de Hurtado Gandini Abogados.
Tu usuario es un ADMINISTRADOR de la firma.
Tus funciones principales:
1. Analizar métricas de volumen, carga de casos y urgencias operativas.
2. Responder con datos directos y estrategias de optimización.
Mantén un tono ejecutivo y enfocado en la eficiencia.`
  }
  return 'Eres un asistente útil.'
}

async function procesarChat(mensaje, historialAnterior = [], procesoId = null, rol = 'cliente') {
  const instruccion = obtenerInstruccionSistema(rol)
  
  let prompt = ''
  if (rol !== 'admin') {
    const contextoRAG = await construirContextoRAG(procesoId, rol)
    prompt = `=== CONTEXTO DEL SISTEMA (RAG) ===\n${contextoRAG}\n=================================\n\n`
  }

  prompt += `Mensaje del usuario (${rol}): ${mensaje}`

  // Convertir historial del frontend al formato OpenAI/Fallback
  let messages = [{ role: 'system', content: instruccion }]
  
  historialAnterior.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })
  })

  messages.push({ role: 'user', content: prompt })
  
  try {
    const responseText = await executeWithFallback(messages, 'text', 0.3)
    return responseText
  } catch (error) {
    console.error('Error en Chatbot IA:', error.message)
    // Degradamos con un mensaje amable (respuesta normal, sin error rojo).
    const msg = String(error?.message || '')
    const esCuota = msg.includes('429') || /quota|too many requests|rate.?limit/i.test(msg)
    if (esCuota) {
      return 'El asistente de IA está recibiendo muchas consultas en este momento y alcanzó su límite temporal. Por favor vuelve a intentarlo en unos minutos. 🙏'
    }
    return 'El asistente de IA no está disponible en este momento. Por favor inténtalo de nuevo más tarde.'
  }
}

module.exports = { procesarChat }
