// Demo opcional (criterio 4): marca vencimientos próximos en actuaciones EXISTENTES
// para que el panel de Alertas proactivas muestre datos en vivo.
// Los procesos reales pueden no tener audiencias futuras pendientes, así que esto
// garantiza una demostración. NO crea procesos ni partes ficticias.
//
// Uso:  node src/jobs/seedVencimientos.js
const prisma = require('../db')

function enDias(n) {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + n)
  return d
}

async function main() {
  const actuaciones = await prisma.actuacion.findMany({
    orderBy: { detectadaEn: 'desc' },
    take: 3,
    include: { proceso: true },
  })

  if (actuaciones.length === 0) {
    console.log('No hay actuaciones en la BD. Consulta primero un radicado desde la vista del abogado.')
    return
  }

  // Escenarios alineados a los ejemplos del reto.
  const escenarios = [
    { dias: 2, tipo: 'termino', criticidad: 'Critica' }, // término vence en 3 días
    { dias: 9, tipo: 'audiencia', criticidad: 'Critica' }, // audiencia en ~10 días
    { dias: 4, tipo: 'traslado', criticidad: 'Importante' },
  ]

  for (let i = 0; i < actuaciones.length; i++) {
    const a = actuaciones[i]
    const e = escenarios[i] || escenarios[0]
    await prisma.actuacion.update({
      where: { id: a.id },
      data: {
        fechaVencimiento: enDias(e.dias),
        tipoVencimiento: e.tipo,
        criticidad: e.criticidad, // para que la ventana de antelación aplique
      },
    })
    console.log(
      `Vencimiento demo -> ${e.tipo} en ${e.dias} día(s) | radicado ${a.proceso?.radicado || '?'} | "${a.titulo}"`
    )
  }

  console.log('\nListo. Abre la vista "Alertas" del abogado para verlas.')
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())
