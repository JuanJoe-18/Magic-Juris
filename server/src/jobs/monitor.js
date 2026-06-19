// Runner del módulo C. Uso:
//   node src/jobs/monitor.js --radicado=<23 dígitos>   (consulta a demanda)
//   node src/jobs/monitor.js --all                      (todos los procesos, una vez)
//   node src/jobs/monitor.js --watch                    (programado cada INTERVALO_MIN)
require('dotenv').config()
const {
  monitorearPorRadicado,
  monitorearTodos,
} = require('../services/monitoreo')

async function correr(args) {
  const radArg = args.find((a) => a.startsWith('--radicado='))

  if (radArg) {
    const r = await monitorearPorRadicado(radArg.split('=')[1])
    console.log(`Radicado ${r.radicado}: ${r.nuevas} actuación(es) nueva(s).`)
    r.detalle.forEach((a) =>
      console.log(`  + ${a.fecha.toISOString().slice(0, 10)} · ${a.titulo} [${a.criticidad}]`)
    )
    return
  }

  // --all o --watch → recorrer todos
  const res = await monitorearTodos()
  const totalNuevas = res.reduce((s, x) => s + (x.nuevas || 0), 0)
  console.log(`Monitoreo completo · ${res.length} procesos · ${totalNuevas} nueva(s) actuación(es)`)
  res.forEach((x) =>
    console.log(`  - ${x.radicado}: ${x.error ? `ERROR ${x.error}` : `${x.nuevas} nueva(s)`}`)
  )
}

async function main() {
  const args = process.argv.slice(2)
  const watch = args.includes('--watch')
  const algo = args.includes('--all') || watch || args.some((a) => a.startsWith('--radicado='))

  if (!algo) {
    console.log('Uso: node src/jobs/monitor.js [--radicado=<23 dígitos> | --all | --watch]')
    process.exit(0)
  }

  if (watch) {
    const min = Number(process.env.INTERVALO_MIN || 240) // RNF-09 (configurable)
    console.log(`Monitoreo programado cada ${min} min (Ctrl+C para salir).`)
    await correr(args)
    setInterval(() => correr(args).catch((e) => console.error(e)), min * 60 * 1000)
  } else {
    await correr(args)
    process.exit(0)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
