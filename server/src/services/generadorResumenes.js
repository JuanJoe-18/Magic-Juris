const { executeWithFallback } = require('./aiFallback')
const prisma = require('../db')

// Genera los resúmenes y los persiste en la BD
async function generarYGuardarResumenes(actuacion, descripcionAnonimizada) {
  const hoyISO = new Date().toISOString().slice(0, 10)
  const systemInstruction = `Eres un asistente jurídico experto de la firma Hurtado Gandini.
Hoy es ${hoyISO}.
Tu objetivo es tomar una anotación de la Rama Judicial de Colombia y devolver un JSON con:
1. "cliente": Lenguaje llano, claro, empático, sin jerga. En máximo 3 oraciones diferencia explícitamente: (a) lo que YA ocurrió, (b) lo que ocurrirá PRÓXIMAMENTE si hay una fecha o diligencia futura, y (c) si el cliente DEBE hacer algo o si la firma se encarga.
2. "abogado": Lenguaje técnico-jurídico, mencionando etapa procesal, artículos (ej. CGP, CPACA, CPTSS), riesgos, términos de ejecutoria/traslados y acciones estratégicas. Máximo 3 oraciones.
3. "fechaVencimiento": Si la anotación menciona una fecha futura relevante (audiencia, diligencia, vencimiento de término o traslado), devuélvela en formato "YYYY-MM-DD". Si no hay ninguna fecha futura clara, devuelve null.
4. "tipoVencimiento": Una de: "audiencia", "termino", "traslado", "diligencia". Si fechaVencimiento es null, devuelve null.

Regla Estricta: Devuelve EXCLUSIVAMENTE un objeto JSON válido con las claves "cliente", "abogado", "fechaVencimiento" y "tipoVencimiento". No inventes fechas: solo extrae las que aparezcan literalmente en el texto.`

  const prompt = `Por favor analiza esta actuación:
Tipo: ${actuacion.tipo}
Título: ${actuacion.titulo}
Fecha de la actuación: ${actuacion.fecha ? new Date(actuacion.fecha).toISOString().slice(0, 10) : 'desconocida'}
Descripción (anonimizada): ${descripcionAnonimizada}`

  try {
    const messages = [
      { role: 'system', content: systemInstruction },
      { role: 'user', content: prompt }
    ]

    const txt = await executeWithFallback(messages, 'json', 0.2)
    const json = JSON.parse(txt)

    const baseData = {
      actuacionId: actuacion.id,
      anonimizado: true, // Cumplimiento RF-25
      modelo: 'fallback-cluster', // Indicamos que se usó el cluster de IA
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

    // 3. Persistir la fecha de vencimiento detectada (alerta proactiva RF-26).
    // Solo guardamos fechas válidas y futuras; descartamos pasadas/ inválidas.
    if (json.fechaVencimiento) {
      const fv = new Date(json.fechaVencimiento)
      const esValida = !Number.isNaN(fv.getTime())
      const esFutura = esValida && fv.getTime() >= Date.now() - 86400000 // tolera "hoy"
      if (esValida && esFutura) {
        await prisma.actuacion.update({
          where: { id: actuacion.id },
          data: {
            fechaVencimiento: fv,
            tipoVencimiento: json.tipoVencimiento || 'diligencia',
          },
        })
      }
    }
    return true
  } catch (err) {
    console.error('Error generando resúmenes IA (Fallback total):', err.message)
    return false
  }
}

module.exports = { generarYGuardarResumenes }
