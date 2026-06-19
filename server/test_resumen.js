const { generarYGuardarResumenes } = require('./src/services/generadorResumenes');
const prisma = require('./src/db');
require('dotenv').config();

async function test() {
  console.log("Iniciando prueba...");
  
  // Actuación dummy (no necesita estar en DB para probar la parte de Gemini, 
  // pero fallará en el Prisma create si el actuacionId no existe en DB. 
  // Mejor probemos solo la función principal, así que mockeamos prisma temporalmente o lo manejamos).
  
  // Vamos a probar creando una Actuación ficticia primero en DB (o usando una real)
  const proceso = await prisma.proceso.findFirst();
  if (!proceso) {
    console.log("No hay procesos en DB. Corre npm run seed primero.");
    return;
  }
  
  const actuacion = await prisma.actuacion.create({
    data: {
      procesoId: proceso.id,
      fecha: new Date(),
      tipo: 'Auto',
      titulo: 'Auto admisorio de la demanda',
      descripcion: 'Se admite la demanda laboral instaurada por [PARTE_1] contra [PARTE_2]. Se ordena correr traslado a la parte demandada por el término de 10 días.',
      criticidad: 'Importante',
      estado: 'E1',
      claveFuente: 'TEST-' + Date.now()
    }
  });

  console.log("Generando resúmenes...");
  const res = await generarYGuardarResumenes(actuacion, actuacion.descripcion);
  console.log("\nResultado de Gemini:\n", JSON.stringify(res, null, 2));
  
  const resumenesDB = await prisma.resumen.findMany({ where: { actuacionId: actuacion.id }});
  console.log("\nGuardado en BD:\n", resumenesDB);
}

test().catch(console.error).finally(() => prisma.$disconnect());
