import { X } from 'lucide-react'
import DetalleSuperficialSvg from '../assets/figma/DetalleSuperficial.svg'
import HistorialConEjemploSvg from '../assets/figma/HistorialConEjemplo.svg'
import AsignacionVaciaSvg from '../assets/figma/AsignacionVacia.svg'

// ── Panel de detalle de un proceso (Nativo - SVGR Component) ──
export default function ProcessDetail({ proceso, onClose }) {
  if (!proceso) return null
  
  const actuaciones = proceso.actuaciones || []
  const hasActuaciones = actuaciones.length > 0
  const isNuevo = hasActuaciones && actuaciones[0].estado === 'Nuevo'

  return (
    <div className="flex h-full flex-col relative w-full items-center justify-start overflow-y-auto no-scrollbar">
      {/* Botón Cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 rounded-full bg-[#1C1C1C] p-2 text-white/50 border border-[#3A3A3A] transition-colors hover:bg-[#3A3A3A] hover:text-white shadow-xl"
        aria-label="Cerrar detalle"
      >
        <X size={16} />
      </button>

      {/* Renderizado Directo del DOM del Figma */}
      <div className="w-full flex justify-center mt-2 pointer-events-auto">
        {!hasActuaciones ? (
          <AsignacionVaciaSvg className="w-full max-w-[700px] h-auto" />
        ) : isNuevo ? (
          <DetalleSuperficialSvg className="w-full max-w-[700px] h-auto" />
        ) : (
          <HistorialConEjemploSvg className="w-full max-w-[700px] h-auto" />
        )}
      </div>
    </div>
  )
}
