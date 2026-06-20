// Utilidades de UI para las vistas del abogado.
// Mapea la criticidad del mockData a la guia visual mostrada en pantalla.

export const clasificacionConfig = {
  Critica: {
    nivel: 'Rojo',
    color: '#C5202E',
    rango: 'Urgente',
    nota: 'Clasificacion alta, requiere accion inmediata.',
  },
  Importante: {
    nivel: 'Amarillo',
    color: '#C79B2B',
    rango: 'Importante',
    nota: 'Clasificacion media, sin alerta inmediata.',
  },
  Informativa: {
    nivel: 'Verde',
    color: '#3FA66B',
    rango: 'Informativo',
    nota: 'Clasificacion baja, seguimiento informativo.',
  },
}

export function clase(criticidad) {
  return clasificacionConfig[criticidad] ?? clasificacionConfig.Informativa
}

const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g')

export function nombreDocumento(act) {
  if (!act?.tipo) return 'Sin documento asociado'
  if (act.tipo === 'Constancia') return 'Sin documento asociado'

  const fecha = (act.fecha || '').replace(/-/g, '')
  const slug = act.tipo
    .normalize('NFD')
    .replace(COMBINING, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')

  return `${fecha}_${slug}.pdf`
}

export function tipoCliente() {
  return 'Demandante'
}
