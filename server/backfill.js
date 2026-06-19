const prisma = require('./src/db');
const { generarYGuardarResumenes } = require('./src/services/generadorResumenes');

async function backfill() {
  const radicado = '76001310300220230012600';
  const proceso = await prisma.proceso.findUnique({ where: { radicado }});
  
  if (!proceso) {
    console.log("Proceso no encontrado");
    return;
  }

  const ultimaActuacion = await prisma.actuacion.findFirst({
    where: { procesoId: proceso.id },
    orderBy: { fecha: 'desc' }
  });

  if (!ultimaActuacion) {
    console.log("No hay actuaciones");
    return;
  }

  console.log("Generando resumen para la última actuación:", ultimaActuacion.titulo);
  await generarYGuardarResumenes(ultimaActuacion, ultimaActuacion.descripcion);
  console.log("Listo. Recarga el frontend.");
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
