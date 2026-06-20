const { OpenAI } = require('openai')
const prisma = require('../db')

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

// Genera los resúmenes y los persiste en la BD
async function generarYGuardarResumenes(actuacion, descripcionAnonimizada) {
  const client = getClient()
  if (!client) {
    console.warn('⚠️ OPENCODE_API_KEY no configurada, omitiendo resúmenes (RF-21/22)')
    return null
  }

  const systemInstruction = `Eres un asistente jurídico experto de la firma Hurtado Gandini.
Tu objetivo es tomar una anotación de la Rama Judicial de Colombia y generar dos resúmenes del mismo evento:
1. "cliente": Lenguaje llano, claro, empático, sin jerga. Explícale al cliente qué pasó, si es bueno/malo, y si debe hacer algo (o si nosotros nos encargamos). Máximo 3 oraciones.
2. "abogado": Lenguaje técnico-jurídico, mencionando la etapa procesal, artículos (ej. CGP, CPACA, CPTSS), riesgos, términos de ejecutoria/traslados y acciones estratégicas a tomar. Máximo 3 oraciones.

Regla Estricta: Devuelve EXCLUSIVAMENTE un objeto JSON válido con las claves "cliente" y "abogado".`

  const prompt = `Por favor genera los resúmenes para esta actuación:
Tipo: ${actuacion.tipo}
Título: ${actuacion.titulo}
Descripción (anonimizada): ${descripcionAnonimizada}`

  try {
    const res = await client.chat.completions.create({
      model: process.env.OPENCODE_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const txt = res.choices[0].message.content
    const json = JSON.parse(txt)

    const baseData = {
      actuacionId: actuacion.id,
      anonimizado: true, // Cumplimiento RF-25
      modelo: process.env.OPENCODE_MODEL || 'gpt-4o-mini',
    }

    // 1. Crear resumen Cliente
    if (json.cliente) {
      await prisma.resumen.create({
        data: {
          ...baseData,
          rolDestino: 'cliente',
          contenido: json.cliente,
        },
      })
    }

    // 2. Crear resumen Abogado
    if (json.abogado) {
      await prisma.resumen.create({
        data: {
          ...baseData,
          rolDestino: 'abogado',
          contenido: json.abogado,
        },
      })
    }

    return true
  } catch (err) {
    console.error('Error generando resúmenes IA:', err.message)
    return false
  }
}

module.exports = { generarYGuardarResumenes }
