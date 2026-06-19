// Clasificador por REGLAS (rápido, gratis, determinista). Resuelve los casos
// obvios SOLO según el TIPO de actuación (la etiqueta oficial), nunca según la
// anotación libre (que mete ruido). Devuelve null si el tipo no es claro → IA.
const REGLAS = [
  {
    criticidad: 'Critica',
    estado: 'E2',
    kw: /audiencia|fija fecha|fallo|sentencia|inadmis|subsan|vencimiento|t[eé]rmino/i,
  },
  {
    criticidad: 'Importante',
    estado: 'E3',
    kw: /traslado|prueba|mandamiento|cautelar|decide recurso|reconoce personer/i,
  },
  {
    criticidad: 'Informativa',
    estado: 'E1',
    kw: /constancia|fijaci[oó]n (de )?estado|al despacho|ob[eé]dezcase|c[uú]mplase|reparto|recepci[oó]n|env[ií]o|memorial/i,
  },
]

function clasificarRegla(act) {
  // Solo el tipo/título oficial — NO la anotación.
  const txt = `${act.titulo || act.tipo || ''}`.trim()
  for (const r of REGLAS) {
    if (r.kw.test(txt)) {
      return {
        criticidad: r.criticidad,
        estado: r.estado,
        parte: null,
        motivo: 'Coincidencia por regla (tipo de actuación)',
        confianza: 1,
        fuente: 'reglas',
      }
    }
  }
  return null
}

// Mapeo de la actuación a su etapa del modelo de estados (RF-20).
function estadoDe(act) {
  const t = `${act.titulo || act.tipo || ''}`.toLowerCase()
  if (/sentencia|fallo|apelaci|recurso|ejecutoria/.test(t)) return 'E4'
  if (/prueba|traslado|alegatos|conciliaci|excepci/.test(t)) return 'E3'
  if (/audiencia|fija fecha/.test(t)) return 'E2'
  if (/admisor|admisi[oó]n|notificaci|reparto|al despacho|reconoce|subsan|inadmis/.test(t))
    return 'E1'
  return 'E1'
}

module.exports = { clasificarRegla, estadoDe }
