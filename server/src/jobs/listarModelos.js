// Diagnóstico: lista los modelos que tu GEMINI_API_KEY puede usar con generateContent.
//   npm run listar:modelos
require('dotenv').config()

async function main() {
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    console.log('Falta GEMINI_API_KEY en .env')
    return
  }
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
  )
  const data = await res.json()

  if (!data.models) {
    console.log('Respuesta inesperada:')
    console.log(JSON.stringify(data, null, 2))
    return
  }

  console.log('Modelos disponibles para tu key (que soportan generateContent):\n')
  let n = 0
  for (const m of data.models) {
    if ((m.supportedGenerationMethods || []).includes('generateContent')) {
      console.log(`  ${m.name.replace('models/', '')}   (${m.displayName})`)
      n++
    }
  }
  if (n === 0) console.log('  (ninguno soporta generateContent con esta key)')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
