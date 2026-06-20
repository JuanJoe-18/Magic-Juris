// Reprocesa la cola de reintento (RNF-12). Ejecutar periódicamente o tras una
// caída de la fuente: reintenta cada radicado pendiente (con el backoff de la
// fuente) y lo marca completado, o fallido tras agotar MAX_INTENTOS.
//
// Uso:  node src/jobs/procesarCola.js   (o npm run cola)
const prisma = require('../db')
const { monitorearPorRadicado } = require('../services/monitoreo')
const { listarPendientes, marcarCompletada, marcarFallida, encolar, MAX_INTENTOS } = require('../services/cola')

async function main() {
  const pendientes = await listarPendientes()
  if (!pendientes.length) {
    console.log('Cola vacía. Nada que reprocesar.')
    return
  }
  console.log(`Reprocesando ${pendientes.length} consulta(s) pendiente(s)...\n`)

  for (const item of pendientes) {
    try {
      const r = await monitorearPorRadicado(item.radicado)
      await marcarCompletada(item.radicado)
      console.log(`✓ COMPLETADA ${item.radicado} -> ${r.nuevas} actuación(es) nueva(s)`)
    } catch (e) {
      if (item.intentos + 1 >= MAX_INTENTOS) {
        await marcarFallida(item.radicado, e.message)
        console.log(`✗ FALLIDA (definitiva, ${item.intentos + 1} intentos) ${item.radicado}: ${e.message}`)
      } else {
        await encolar(item.radicado, e.message) // sigue pendiente, +1 intento
        console.log(`… SIGUE PENDIENTE ${item.radicado} (intento ${item.intentos + 1}): ${e.message}`)
      }
    }
  }
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
