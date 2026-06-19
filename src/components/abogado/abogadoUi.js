// ── Utilidades de UI para las vistas del Abogado (diseño Fajardo) ──
// Mapea la criticidad del mockData (Critica/Importante/Informativa) a la
// "Guía Visual de Clasificación" del Figma (Alta / Media / Baja).

export const clasificacionConfig = {
  Critica: {
    nivel: 'Alta',
    color: '#C5202E',
    rango: 'De 1 a 7 días',
    nota: 'Clasificación alta · requiere acción inmediata.',
  },
  Importante: {
    nivel: 'Media',
    color: '#C79B2B',
    rango: 'De 7 a 20 días',
    nota: 'Clasificación media, sin alerta inmediata.',
  },
  Informativa: {
    nivel: 'Baja',
    color: '#3FA66B',
    rango: 'De 20 a 30 días',
    nota: 'Clasificación baja · seguimiento informativo.',
  },
}

export function clase(criticidad) {
  return clasificacionConfig[criticidad] ?? clasificacionConfig.Informativa
}

const COMBINING = new RegExp('[\\u0300-\\u036f]', 'g')

// Nombre de documento sintético a partir de una actuación (estilo Rama Judicial).
export function nombreDocumento(act) {
  if (!act?.tipo) return 'Sin documento asociado'
  // Algunas actuaciones son meramente internas → sin documento.
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

// Tipo de parte (Demandante / Demandado) que la firma representa.
// El mockData no lo trae, así que se usa un valor estable por defecto.
export function tipoCliente() {
  return 'Demandante'
}
