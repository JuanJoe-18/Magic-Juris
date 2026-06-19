// Prueba de viabilidad de la fuente (sin tocar la base de datos).
// Llama al adaptador activo (FUENTE_JUDICIAL) y muestra lo que devuelve.
//   node src/jobs/probarFuente.js --radicado=76001310300220230012600
require('dotenv').config()
const { fuente, FUENTE } = require('../sources')

async function main() {
  const args = process.argv.slice(2)
  const radArg = args.find((a) => a.startsWith('--radicado='))
  const radicado = radArg ? radArg.split('=')[1] : '76001310300220230012600'

  console.log(`Fuente: ${FUENTE} · Radicado: ${radicado}\n`)
  const r = await fuente.consultarPorRadicado(radicado)

  if (!r.idProceso) {
    console.log('No se encontró el proceso (con la fuente simulada usa un radicado del seed).')
    return
  }

  console.log(`idProceso: ${r.idProceso}`)
  console.log(`despacho:  ${r.despacho || '-'}`)
  console.log(`actuaciones: ${r.actuaciones.length}\n`)
  r.actuaciones.slice(0, 8).forEach((a) =>
    console.log(`  ${a.fecha} · ${a.titulo}${a.descripcion ? ` — ${a.descripcion.slice(0, 70)}` : ''}`)
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
