import { Bell } from 'lucide-react'
import RoleSwitcher from '../shared/RoleSwitcher'

// ── Encabezado superior de la vista del Abogado (diseño Fajardo) ──
// Logo HG (vuelve a la landing) · subtítulo central · pill de usuario.
export default function AbogadoHeader({
  titulo,
  subtitulo,
  onHome,
  mostrarCampana,
  rolActual,
  onSwitchRole,
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-1 py-2">
      {/* Logo HG */}
      <button
        onClick={onHome}
        title="Volver al inicio"
        className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
      >
        <span className="font-sora text-xl font-bold leading-none tracking-tight text-white uppercase">
          Hurtado Gandini
        </span>
      </button>

      {/* Título central */}
      <div className="min-w-0 flex-1 text-center">
        <p className="text-[12px] font-medium tracking-wide text-hg-gray">
          Sistema de seguimiento judicial
        </p>
        <h2 className="truncate font-sora text-base font-bold text-white md:text-lg">
          Powered by MagicJuris
        </h2>
      </div>

      {/* Usuario */}
      <div className="flex items-center gap-3">
        {onSwitchRole && (
          <RoleSwitcher
            actual={rolActual}
            onSwitch={onSwitchRole}
            onHome={onHome}
          />
        )}
        {mostrarCampana && (
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#161616] text-white/70 transition-colors hover:text-white"
            title="Notificaciones"
          >
            <Bell size={16} />
          </button>
        )}
        <div className="flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#161616] px-4 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#A30F0A] shadow-[0_0_8px_rgba(163,15,10,0.8)]" />
          <span className="text-sm font-semibold text-white">Juan S Muñoz</span>
          <span className="text-[11px] font-semibold tracking-wide text-white/45">ABOGADO</span>
        </div>
      </div>
    </header>
  )
}
