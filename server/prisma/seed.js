// Seed del MVP — pobla la base con los datos de demostración del frontend (mockData.json).
// Idempotente: limpia y vuelve a crear. Ejecutar: npm run seed
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const path = require('path')
const { claveDerivada } = require('../src/lib/clave')

const prisma = new PrismaClient()

// Reutilizamos los datos de demostración del frontend.
const mock = require(path.join(__dirname, '..', '..', 'src', 'data', 'mockData.json'))

const slug = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '')

const ANTELACION = { Critica: 7, Importante: 20, Informativa: 30 }

function nombreDocumento(a) {
  if (!a.tipo || a.tipo === 'Constancia') return null
  const fecha = (a.fecha || '').replace(/-/g, '')
  const t = a.tipo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
  return `${fecha}_${t}.pdf`
}

async function limpiar() {
  // Orden inverso a las dependencias.
  await prisma.comunicacion.deleteMany()
  await prisma.lecturaActuacion.deleteMany()
  await prisma.resumen.deleteMany()
  await prisma.actuacion.deleteMany()
  await prisma.tratamientoDatos.deleteMany()
  await prisma.procesoAbogado.deleteMany()
  await prisma.solicitudHabeas.deleteMany()
  await prisma.proceso.deleteMany()
  await prisma.usuario.deleteMany()
  await prisma.configCriticidad.deleteMany()
}

async function main() {
  await limpiar()

  // 1) Configuración de criticidad (RF-19)
  for (const [nivel, dias] of Object.entries(ANTELACION)) {
    await prisma.configCriticidad.create({
      data: { nivel, antelacionDias: dias, canalDefault: 'correo' },
    })
  }

  // 2) Admin + abogado responsable
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administración HG',
      email: 'admin@hg.com',
      passwordHash: 'demo', // RF-01: hashing real lo implementa el módulo A
      rol: 'admin',
    },
  })

  const abogado = await prisma.usuario.create({
    data: {
      nombre: mock.abogadoActivo?.nombre || 'Dra. Valentina Hurtado',
      email: 'valentina.hurtado@hg.com',
      passwordHash: 'demo',
      rol: 'abogado',
      tarjetaProfesional: mock.abogadoActivo?.tarjetaProfesional || 'TP 248915',
    },
  })

  // 3) Procesos + clientes + actuaciones + resúmenes + comunicación
  for (const p of mock.procesos) {
    const email = `${slug(p.cliente)}@correo.com`
    const cliente = await prisma.usuario.create({
      data: { nombre: p.cliente, email, passwordHash: 'demo', rol: 'cliente' },
    })

    const proceso = await prisma.proceso.create({
      data: {
        radicado: p.radicado,
        clienteId: cliente.id,
        jurisdiccion: p.jurisdiccion,
        despacho: p.despacho,
        // Partes (demandante/demandado) NO se inventan: las llena la consulta real.
        estado: p.estado,
        estadoLabel: p.estadoLabel,
        creadoPorId: abogado.id,
        abogados: { create: [{ abogadoId: abogado.id }] },
        tratamiento: {
          create: {
            finalidad: 'Seguimiento judicial y atención proactiva al cliente',
            baseLegitimacion: 'poder',
          },
        },
      },
    })

    // Actuaciones (línea de tiempo)
    let ultima = null
    for (const a of p.lineaTiempo || []) {
      ultima = await prisma.actuacion.create({
        data: {
          procesoId: proceso.id,
          fecha: new Date(a.fecha),
          tipo: a.tipo,
          titulo: a.titulo,
          descripcion: a.descripcion,
          criticidad: a.criticidad,
          estado: a.estado,
          documento: nombreDocumento(a),
          claveFuente: claveDerivada({
            fecha: a.fecha,
            titulo: a.titulo,
            descripcion: a.descripcion,
          }),
        },
      })
    }

    // Resúmenes IA (cliente + abogado) + comunicación enviada
    if (ultima) {
      const rCliente = await prisma.resumen.create({
        data: {
          actuacionId: ultima.id,
          rolDestino: 'cliente',
          contenido: p.resumenCliente,
          anonimizado: true,
          modelo: 'seed',
        },
      })
      await prisma.resumen.create({
        data: {
          actuacionId: ultima.id,
          rolDestino: 'abogado',
          contenido: p.resumenAbogado,
          anonimizado: false,
          modelo: 'seed',
        },
      })
      await prisma.comunicacion.create({
        data: {
          procesoId: proceso.id,
          resumenId: rCliente.id,
          destinatario: email,
          canal: 'correo',
          estado: 'entregado',
        },
      })
    }
  }

  // ── Proceso REAL registrado (radicado existente en la Rama Judicial) ──
  // Permite consultar partes y actuaciones reales con FUENTE_JUDICIAL="real".
  // Las partes NO se siembran: las obtiene la consulta a la Rama Judicial.
  const clienteReal = await prisma.usuario.create({
    data: {
      nombre: 'Cliente Demo (caso real)',
      email: 'casoreal@correo.com',
      passwordHash: 'demo',
      rol: 'cliente',
    },
  })
  await prisma.proceso.create({
    data: {
      radicado: '76001310300220230012600',
      clienteId: clienteReal.id,
      jurisdiccion: 'civil',
      estado: 'E0',
      estadoLabel: 'Registrado',
      creadoPorId: abogado.id,
      abogados: { create: [{ abogadoId: abogado.id }] },
      tratamiento: {
        create: {
          finalidad: 'Seguimiento judicial y atención proactiva al cliente',
          baseLegitimacion: 'poder',
        },
      },
    },
  })

  const totales = {
    usuarios: await prisma.usuario.count(),
    procesos: await prisma.proceso.count(),
    actuaciones: await prisma.actuacion.count(),
    resumenes: await prisma.resumen.count(),
    comunicaciones: await prisma.comunicacion.count(),
  }
  console.log('Seed completo ✔', totales)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
