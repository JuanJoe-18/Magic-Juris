const { OpenAI } = require('openai')
const prisma = require('../db')
const { anonimizar } = require('../lib/anonimizar')

function getClient() {
  if (process.env.AZURE_OPENAI_API_KEY) {
    return new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: process.env.AZURE_OPENAI_ENDPOINT,
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY }
    })
  }
  if (!process.env.OPENCODE_API_KEY) return null
  return new OpenAI({
    apiKey: process.env.OPENCODE_API_KEY,
    baseURL: 'https://opencode.ai/zen/v1',
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
  const client = getClient()
  
  if (!client) throw new Error('API Key no configurada')

  let prompt = ''
  if (rol !== 'admin') {
    const contextoRAG = await construirContextoRAG(procesoId, rol)
    prompt = `=== CONTEXTO DEL SISTEMA (RAG) ===\n${contextoRAG}\n=================================\n\n`
  }

  prompt += `Mensaje del usuario (${rol}): ${mensaje}`

  // Convertir historial del frontend al formato OpenAI
  let messages = [{ role: 'system', content: instruccion }]
  
  historialAnterior.forEach(msg => {
    messages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    })
  })

  messages.push({ role: 'user', content: prompt })
  
  try {
    const res = await client.chat.completions.create({
      model: process.env.OPENCODE_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.3,
    })
    return res.choices[0].message.content
  } catch (error) {
    console.error('Error en Chatbot IA:', error.message)
    throw new Error('Lo siento, estoy teniendo problemas de conexión con el servicio de IA. Intenta de nuevo más tarde.')
  }
}

module.exports = { procesarChat }
