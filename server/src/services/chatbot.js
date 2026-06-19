const { GoogleGenerativeAI } = require('@google/generative-ai')
const prisma = require('../db')
const { anonimizar } = require('../lib/anonimizar')

function getModel(systemInstruction) {
  if (!process.env.GEMINI_API_KEY) return null
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: { temperature: 0.3 }, // Un poco de creatividad, pero respuestas consistentes
  })
}

// Extrae el contexto del proceso desde la DB dependiendo del rol (RAG)
async function construirContextoRAG(procesoId, rol) {
  if (!procesoId) return 'No hay contexto de un proceso específico.'

  const proceso = await prisma.proceso.findUnique({
    where: { id: procesoId },
    include: {
      actuaciones: { orderBy: { fecha: 'desc' }, take: 5 }, // Últimas 5
    },
  })

  if (!proceso) return 'El proceso no existe en la base de datos.'

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
  const model = getModel(instruccion)
  
  if (!model) throw new Error('API Key no configurada')

  let prompt = ''
  if (rol !== 'admin') {
    const contextoRAG = await construirContextoRAG(procesoId, rol)
    prompt = `=== CONTEXTO DEL SISTEMA (RAG) ===\n${contextoRAG}\n=================================\n\n`
  }

  prompt += `Mensaje del usuario (${rol}): ${mensaje}`

  // Convertir historial del frontend al formato que espera Gemini (contents).
  // Gemini exige que el primer mensaje del historial sea del 'user'.
  let historyRaw = historialAnterior.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }))
  
  // Eliminar mensajes 'model' iniciales (ej. el saludo del frontend)
  while (historyRaw.length > 0 && historyRaw[0].role === 'model') {
    historyRaw.shift()
  }

  const chatSession = model.startChat({ history: historyRaw })
  
  try {
    const result = await chatSession.sendMessage(prompt)
    return result.response.text()
  } catch (error) {
    console.error('Error en Chatbot IA:', error.message)
    throw new Error('Lo siento, estoy teniendo problemas de conexión con el servicio de IA. Intenta de nuevo más tarde.')
  }
}

module.exports = { procesarChat }
