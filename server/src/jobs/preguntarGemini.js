// Prueba libre de Gemini: hazle preguntas para confirmar que responde de verdad.
//   Una pregunta:   npm run preguntar -- "¿Qué modelo de IA eres?"
//   Modo chat:      npm run preguntar           (luego escribe; "salir" para terminar)
require('dotenv').config()
const readline = require('readline')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const key = process.env.GEMINI_API_KEY
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

if (!key) {
  console.log('Falta GEMINI_API_KEY en .env')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(key)
const model = genAI.getGenerativeModel({ model: modelName })

async function preguntar(texto) {
  const t0 = Date.now()
  const res = await model.generateContent(texto)
  const ms = Date.now() - t0
  console.log(`\n${res.response.text()}\n(— ${modelName}, ${ms} ms)\n`)
}

async function main() {
  const pregunta = process.argv.slice(2).join(' ').trim()

  if (pregunta) {
    console.log(`Modelo: ${modelName}\nPregunta: ${pregunta}`)
    await preguntar(pregunta)
    return
  }

  // Modo chat interactivo
  console.log(`Chat con Gemini (${modelName}). Escribe "salir" para terminar.\n`)
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  const loop = () =>
    rl.question('> ', async (q) => {
      const txt = (q || '').trim()
      if (!txt || txt.toLowerCase() === 'salir') return rl.close()
      try {
        await preguntar(txt)
      } catch (e) {
        console.log('Error:', e.message, '\n')
      }
      loop()
    })
  loop()
}

main().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
