// Prueba del Módulo D: clasifica una muestra de actuaciones de un radicado y
// muestra criticidad/estado + de dónde salió (reglas o gemini).
//   node src/jobs/probarClasificador.js --radicado=76001310300220230012600
require('dotenv').config()
const { fuente, FUENTE } = require('../sources')
const { clasificarLote } = require('../services/clasificacion')
const { anonimizar } = require('../lib/anonimizar')

async function main() {
  const args = process.argv.slice(2)
  const radArg = args.find((a) => a.startsWith('--radicado='))
  const radicado = radArg ? radArg.split('=')[1] : '76001310300220230012600'

  console.log(`Fuente: ${FUENTE} · Clasificador: ${process.env.CLASIFICADOR || 'hibrido'}\n`)
  const { actuaciones } = await fuente.consultarPorRadicado(radicado)
  if (!actuaciones.length) {
    console.log('Sin actuaciones (¿fuente real + radicado real?).')
    return
  }

  const muestra = actuaciones.slice(0, 12)
  const entrada = muestra.map((a) => ({
    tipo: a.tipo,
    titulo: a.titulo,
    descripcion: anonimizar(a.descripcion, []),
  }))
  const clases = await clasificarLote(entrada)

  muestra.forEach((a, i) => {
    const c = clases[i]
    const conf = c.confianza != null ? `, conf ${c.confianza}` : ''
    console.log(`${a.fecha} · ${a.titulo}`)
    console.log(`   → ${c.criticidad} / ${c.estado}  [${c.fuente}${conf}]${c.motivo ? ' · ' + c.motivo : ''}\n`)
  })
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
