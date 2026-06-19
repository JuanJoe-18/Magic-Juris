import { clase } from '../abogado/abogadoUi'

// Formatea ISO → dd/mm/aaaa.
export function fechaDMY(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n) => String(n).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

// Divide el resumen del cliente en las tres preguntas clave.
export function resumenNatural(proceso) {
  if (!proceso) return null
  const texto = (proceso.resumenCliente || '').trim()
  const partes = texto.split(/(?<=\.)\s+/).filter(Boolean)
  const quePaso = partes[0] || 'Tu proceso registró una actualización ante el juzgado.'
  const queHacer =
    partes.length > 1
      ? partes[partes.length - 1]
      : 'Por ahora no debes hacer nada; tu abogado te indicará cualquier acción necesaria.'
  const medio = partes.slice(1, -1).join(' ')
  const queVaPasar =
    medio ||
    `Ahora sigue la etapa de ${(proceso.estadoLabel || 'trámite').toLowerCase()} y la revisión de nuevas actuaciones del despacho.`

  const c = clase(proceso.criticidad)
  return {
    quePaso,
    queVaPasar,
    queHacer,
    urgenciaLabel: c.nivel === 'Alta' ? 'Urgencia' : c.nivel,
    urgenciaColor: c.color,
  }
}

// Construye el historial de correos enviados al cliente (lenguaje claro).
export function correosCliente(proceso) {
  if (!proceso) return []
  const tl = [...(proceso.lineaTiempo ?? [])].sort(
    (a, b) => new Date(a.fecha) - new Date(b.fecha)
  )
  const f = (i, fallback) => fechaDMY(tl[i]?.fecha) || fallback
  return [
    {
      fecha: f(0, '18/06/2026'),
      titulo: 'Resumen de estado del proceso',
      desc: 'Tu proceso fue admitido y actualmente se encuentra en trámite ante el juzgado.',
    },
    {
      fecha: f(1, '21/06/2026'),
      titulo: 'Nueva actuación registrada',
      desc: 'Se detectó una actuación nueva. Tu abogado la está revisando para indicarte si debes hacer algo.',
    },
    {
      fecha: f(2, '25/06/2026'),
      titulo: 'Seguimiento del caso',
      desc: 'Por ahora tu proceso sigue en curso y no requiere una acción inmediata de tu parte.',
    },
    {
      fecha: '29/06/2026',
      titulo: 'Recordatorio importante',
      desc: 'Mantente atento al correo. Si aparece una actuación relevante, te avisaremos nuevamente.',
    },
  ]
}
