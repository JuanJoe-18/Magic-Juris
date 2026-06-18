// ── Utilidades de UI compartidas (criticidad, jurisdicción, tiempos) ──
import {
  Gavel,
  FileText,
  Bell,
  CalendarClock,
  ScrollText,
  FlaskConical,
  ClipboardCheck,
  Scale,
  Briefcase,
  Landmark,
} from 'lucide-react'

// Configuración visual por nivel de criticidad (marca HG).
export const criticidadConfig = {
  Critica: {
    label: 'Crítica',
    bg: '#C5202E',
    text: '#FFFFFF',
    ring: 'rgba(197,32,46,0.6)',
    dot: '#C5202E',
  },
  Importante: {
    label: 'Importante',
    bg: '#B8621A',
    text: '#FFFFFF',
    ring: 'rgba(184,98,26,0.5)',
    dot: '#B8621A',
  },
  Informativa: {
    label: 'Informativa',
    bg: '#1A5C8A',
    text: '#FFFFFF',
    ring: 'rgba(26,92,138,0.5)',
    dot: '#1A5C8A',
  },
}

// Orden de prioridad para ordenar procesos (Crítica primero).
export const criticidadPeso = { Critica: 3, Importante: 2, Informativa: 1 }

// Etiqueta y color por jurisdicción.
export const jurisdiccionConfig = {
  civil: { label: 'Civil', icon: Scale, color: '#9CA3AF' },
  laboral: { label: 'Laboral', icon: Briefcase, color: '#9CA3AF' },
  administrativo: { label: 'Administrativo', icon: Landmark, color: '#9CA3AF' },
}

// Ícono por tipo de actuación en la línea de tiempo.
export const tipoActuacionIcon = {
  Auto: FileText,
  Notificacion: Bell,
  Audiencia: CalendarClock,
  Traslado: ScrollText,
  Prueba: FlaskConical,
  Constancia: ClipboardCheck,
  Fallo: Gavel,
  Radicacion: FileText,
}

// Formatea un radicado de 23 dígitos en grupos legibles.
export function formatRadicado(radicado) {
  if (!radicado || radicado.length !== 23) return radicado
  // 5-2-2-2-4-4-2 → municipio · entidad · despacho · ... · año · consecutivo
  return `${radicado.slice(0, 5)} ${radicado.slice(5, 9)} ${radicado.slice(
    9,
    11
  )} ${radicado.slice(11, 15)} ${radicado.slice(15, 19)} ${radicado.slice(
    19,
    23
  )}`
}

// Formatea una fecha ISO corta a formato legible en español.
export function formatFecha(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Calcula la cuenta regresiva (días/horas) hasta el vencimiento del término.
// Usa una fecha de referencia fija para que el MVP muestre datos coherentes.
export const HOY_REF = new Date('2026-06-18T08:00:00')

export function calcularCuentaRegresiva(vencimientoISO, ahora = HOY_REF) {
  if (!vencimientoISO) return null
  const fin = new Date(vencimientoISO)
  const ms = fin - ahora
  const vencido = ms < 0
  const absMs = Math.abs(ms)
  const dias = Math.floor(absMs / (1000 * 60 * 60 * 24))
  const horas = Math.floor((absMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  return { vencido, dias, horas, ms }
}
