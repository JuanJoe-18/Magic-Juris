// Clasificador con IA (Google Gemini) usando el MASTER PROMPT de docs como
// instrucción de sistema (lógica jurídica por rama). Devuelve, por lote:
// severidad (Urgente|Importante|Informativo) + sujeto (Demandante|Demandado|Ambos).
const fs = require('fs')
const path = require('path')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const SEV_A_CRITICIDAD = {
  Urgente: 'Critica',
  Importante: 'Importante',
  Informativo: 'Informativa',
}
const SUJETOS = ['Demandante', 'Demandado', 'Ambos']

// Carga el master prompt (sin la sección de formato de salida, que aquí se
// reemplaza por salida JSON en lote). Editable por el equipo en docs/.
let MASTER = null
function getMaster() {
  if (MASTER !== null) return MASTER
  try {
    const p = path.join(__dirname, '..', '..', '..', 'docs', 'Master prompt.md')
    const raw = fs.readFileSync(p, 'utf8')
    const cut = raw.indexOf('REGLA ESTRICTA DE FORMATO')
    MASTER = (cut > 0 ? raw.slice(0, cut) : raw).trim()
  } catch {
    MASTER = '' // si no está el archivo, Gemini opera solo con la instrucción del usuario
  }
  return MASTER
}

function getModel() {
  if (!process.env.GEMINI_API_KEY) return null
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const systemInstruction = `${getMaster()}

NOTA DE INTEGRACIÓN: vas a clasificar en LOTE. Ignora cualquier regla previa de
formato de salida de dos palabras y responde EXCLUSIVAMENTE en el JSON que se te pida.`
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    systemInstruction,
    generationConfig: { responseMimeType: 'application/json', temperature: 0 },
  })
}

// items: [{ indice, tipo, anotacion }] → { [indice]: { criticidad, parte, motivo, confianza, fuente } }
async function clasificarLoteGemini(items) {
  const model = getModel()
  if (!model) throw new Error('GEMINI_API_KEY no configurada')

  const lista = items
    .map(
      (i) =>
        `${i.indice}. Tipo: "${i.tipo}". Anotación: "${i.anotacion || '(sin anotación)'}"`
    )
    .join('\n')

  const prompt = `Aplica las reglas del sistema a cada actuación judicial.
Devuelve EXCLUSIVAMENTE un arreglo JSON, un objeto por actuación, con estas claves exactas:
{"indice": <número>, "severidad": "Urgente"|"Importante"|"Informativo", "sujeto": "Demandante"|"Demandado"|"Ambos", "motivo": "<máximo 6 palabras>"}

Actuaciones:
${lista}`

  const res = await model.generateContent(prompt)
  const txt = res.response.text()

  let arr
  try {
    arr = JSON.parse(txt)
  } catch {
    throw new Error('Respuesta de Gemini no es JSON válido')
  }

  const porIndice = {}
  for (const o of Array.isArray(arr) ? arr : []) {
    const idx = Number(o.indice)
    if (Number.isNaN(idx)) continue
    porIndice[idx] = {
      criticidad: SEV_A_CRITICIDAD[o.severidad] || 'Informativa',
      parte: SUJETOS.includes(o.sujeto) ? o.sujeto : 'Ambos',
      motivo: String(o.motivo || '').slice(0, 120),
      confianza: null, // el master prompt es determinista
      fuente: 'gemini',
    }
  }
  return porIndice
}

module.exports = { clasificarLoteGemini }
