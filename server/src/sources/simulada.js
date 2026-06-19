// Adaptador de fuente SIMULADA — devuelve actuaciones a partir del mockData del
// frontend y, opcionalmente, agrega una "novedad" para demostrar la detección
// por diferencia sin depender del portal real.
const path = require('path')
const { claveDerivada } = require('../lib/clave')
const mock = require(path.join(__dirname, '..', '..', '..', 'src', 'data', 'mockData.json'))

function normaliza(a) {
  const base = {
    fecha: a.fecha,
    tipo: a.tipo,
    titulo: a.titulo,
    descripcion: a.descripcion,
    documento: null,
  }
  return { ...base, claveFuente: claveDerivada(base) }
}

async function consultarPorRadicado(radicado) {
  const p = (mock.procesos || []).find((x) => x.radicado === radicado)
  if (!p) return { idProceso: null, actuaciones: [] }

  const actuaciones = (p.lineaTiempo || []).map(normaliza)

  if (process.env.SIMULAR_NOVEDAD !== '0') {
    const hoy = new Date().toISOString().slice(0, 10)
    const nov = {
      fecha: hoy,
      tipo: 'Auto',
      titulo: 'Auto que ordena seguir adelante la ejecución',
      descripcion:
        'El despacho ordena continuar con las medidas y seguir adelante con la ejecución (actuación simulada para demostrar la detección por diferencia).',
      documento: `${hoy.replace(/-/g, '')}_AUTO_SEGUIR_EJECUCION.pdf`,
    }
    actuaciones.push({ ...nov, claveFuente: claveDerivada(nov) })
  }

  // No inventamos partes: demandante/demandado solo provienen de la fuente real.
  return {
    idProceso: `SIM-${radicado.slice(-5)}`,
    despacho: p.despacho,
    actuaciones,
  }
}

module.exports = { consultarPorRadicado }
