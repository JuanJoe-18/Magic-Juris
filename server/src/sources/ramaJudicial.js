// Adaptador de fuente REAL — API oficial de la Rama Judicial (Consulta de
// Procesos Nacional Unificada). NO es scraping: es una API REST pública que
// devuelve JSON. Opera por CONSULTA A DEMANDA: solo se llama con el radicado de
// un proceso ya registrado (RF-10, RNF-01) — nunca recolección masiva.
//
// Estructura confirmada contra la API real (campos: idRegActuacion, llaveProceso,
// fechaActuacion, actuacion, anotacion, conDocumentos, paginacion).
const { fetchRetry } = require('../lib/fetchRetry')

const BASE =
  process.env.RAMA_API_BASE ||
  'https://consultaprocesos.ramajudicial.gov.co:448/api/v2'

const headers = { Accept: 'application/json' }
const MAX_PAGINAS = 10 // tope de seguridad

function normaliza(a) {
  return {
    claveFuente: String(a.idRegActuacion), // id estable real (RF-15)
    fecha: (a.fechaActuacion || a.fechaRegistro || '').slice(0, 10),
    tipo: a.actuacion || 'Actuación',
    titulo: a.actuacion || 'Actuación',
    descripcion: a.anotacion || '',
    documento: a.conDocumentos ? `${a.idRegActuacion}.pdf` : null,
  }
}

async function consultarPorRadicado(radicado) {
  // 1) idProceso por número de radicación.
  const urlBusqueda = `${BASE}/Procesos/Consulta/NumeroRadicacion?numero=${radicado}&SoloActivos=false&pagina=1`
  const resB = await fetchRetry(urlBusqueda, { headers })
  const dataB = await resB.json()
  const proc = (dataB.procesos || [])[0]
  if (!proc) return { idProceso: null, actuaciones: [] }

  // Respetar procesos reservados/privados (confidencialidad).
  if (proc.esPrivado) {
    return { idProceso: proc.idProceso, despacho: proc.despacho, actuaciones: [], privado: true }
  }

  const idProceso = proc.idProceso

  // 2) Actuaciones (paginadas; 40 por página, de la más nueva a la más vieja).
  const actuaciones = []
  let pagina = 1
  let totalPaginas = 1
  do {
    const urlAct = `${BASE}/Proceso/Actuaciones/${idProceso}?pagina=${pagina}`
    const resA = await fetchRetry(urlAct, { headers })
    const dataA = await resA.json()
    for (const a of dataA.actuaciones || []) actuaciones.push(normaliza(a))
    totalPaginas = dataA.paginacion?.cantidadPaginas || 1
    pagina++
  } while (pagina <= totalPaginas && pagina <= MAX_PAGINAS)

  return { idProceso, despacho: proc.despacho, actuaciones }
}

module.exports = { consultarPorRadicado }
