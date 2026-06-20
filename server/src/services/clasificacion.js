// Orquestador del Módulo D (clasificación de criticidad · RF-18/20).
// Híbrido: las reglas resuelven lo obvio; Gemini (con el master prompt) clasifica
// criticidad + sujeto procesal de lo ambiguo. Resiliente: si Gemini falla, cae a reglas.
const { clasificarRegla, estadoDe } = require('./clasificadorReglas')
const { clasificarLoteGemini } = require('./clasificadorGemini')

const MODO = (process.env.CLASIFICADOR || 'hibrido').toLowerCase()

function porDefecto(a) {
  const r = clasificarRegla(a)
  if (r) return r
  return {
    criticidad: 'Informativa',
    estado: estadoDe(a),
    parte: null,
    motivo: 'Sin clasificar (regla por defecto)',
    confianza: 0.3,
    fuente: 'reglas',
  }
}

// Clasifica un lote de actuaciones (entrada ya anonimizada).
// actuaciones: [{ tipo, titulo, descripcion }]
//   → [{ criticidad, estado, parte, motivo, confianza, fuente }]
async function clasificarLote(actuaciones) {
  const resultados = new Array(actuaciones.length)
  const pendientes = []

  actuaciones.forEach((a, i) => {
    if (MODO !== 'gemini') {
      const r = clasificarRegla(a)
      if (r) {
        resultados[i] = r
        return
      }
    }
    pendientes.push({ indice: i, a })
  })

  if ((MODO === 'hibrido' || MODO === 'gemini') && pendientes.length > 0) {
    const TAM = 20 // troceo para no enviar demasiadas en una sola llamada
    for (let off = 0; off < pendientes.length; off += TAM) {
      const grupo = pendientes.slice(off, off + TAM)
      try {
        const items = grupo.map((p) => ({
          indice: p.indice,
          tipo: p.a.tipo || p.a.titulo,
          anotacion: p.a.descripcion,
        }))
        const porIndice = await clasificarLoteGemini(items)
        for (const p of grupo) {
          const g = porIndice[p.indice]
          // Gemini da criticidad + sujeto; el estado (E0–E4) se mapea aparte.
          resultados[p.indice] = g
            ? { ...g, estado: estadoDe(p.a) }
            : porDefecto(p.a)
        }
      } catch (e) {
        console.warn('[clasificación] Gemini no disponible, usando reglas:', e.message)
        for (const p of grupo) resultados[p.indice] = porDefecto(p.a)
      }
    }
  } else {
    for (const p of pendientes) resultados[p.indice] = porDefecto(p.a)
  }

  return resultados
}

// Clasificación sincrónica solo por reglas (sin IA). Útil como respaldo/pruebas.
function clasificarActuacion(a) {
  return porDefecto(a)
}

module.exports = { clasificarLote, clasificarActuacion }
