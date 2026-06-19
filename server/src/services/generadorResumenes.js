const { GoogleGenerativeAI } = require('@google/generative-ai')
const prisma = require('../db')

function getModel() {
  if (!process.env.GEMINI_API_KEY) return null
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const systemInstruction = `Eres un asistente jurídico experto de la firma Hurtado Gandini.
Tu objetivo es tomar una anotación de la Rama Judicial de Colombia y generar dos resúmenes del mismo evento:
1. "cliente": Lenguaje llano, claro, empático, sin jerga. Explícale al cliente qué pasó, si es bueno/malo, y si debe hacer algo (o si nosotros nos encargamos). Máximo 3 oraciones.
2. "abogado": Lenguaje técnico-jurídico, mencionando la etapa procesal, artículos (ej. CGP, CPACA, CPTSS), riesgos, términos de ejecutoria/traslados y acciones estratégicas a tomar. Máximo 3 oraciones.

Regla Estricta: Devuelve EXCLUSIVAMENTE un objeto JSON válido con las claves "cliente" y "abogado".`

  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
  })
}

// Genera los resúmenes y los persiste en la BD
async function generarYGuardarResumenes(actuacion, descripcionAnonimizada) {
  const model = getModel()
  if (!model) {
    console.warn('⚠️ GEMINI_API_KEY no configurada, omitiendo resúmenes (RF-21/22)')
    return null
  }

  const prompt = `Por favor genera los resúmenes para esta actuación:
Tipo: ${actuacion.tipo}
Título: ${actuacion.titulo}
Descripción (anonimizada): ${descripcionAnonimizada}`

  try {
    const res = await model.generateContent(prompt)
    const txt = res.response.text()
    const json = JSON.parse(txt)

    const baseData = {
      actuacionId: actuacion.id,
      anonimizado: true, // Cumplimiento RF-25
      modelo: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
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

    return json
  } catch (err) {
    console.error('❌ Error generando resúmenes con IA:', err.message)
    return null
  }
}

module.exports = { generarYGuardarResumenes }
