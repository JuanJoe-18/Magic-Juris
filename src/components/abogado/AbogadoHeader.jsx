import { Bell } from 'lucide-react'

import RoleSwitcher from '../shared/RoleSwitcher'
import { LogoHG } from '../shared/TopBar'

export default function AbogadoHeader({
  titulo,
  subtitulo,
  mostrarCampana,
  onHome,
  rolActual,
  onSwitchRole,
  usuario,
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-center lg:justify-between">
      <LogoHG onHome={onHome} />

      <div className="min-w-0 flex-1 text-center">
        {subtitulo && <p className="text-[12px] font-medium tracking-wide text-[#D9D9D9]">{subtitulo}</p>}
        <h2 className="truncate font-sora text-[1.95rem] font-bold text-white">{titulo}</h2>
      </div>

      <div className="flex items-center justify-end gap-3">
        {mostrarCampana && (
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#161616] text-white/70 transition-colors hover:text-white"
            title="Notificaciones"
          >
            <Bell size={18} />
          </button>
        )}

        {onSwitchRole && (
          <RoleSwitcher actual={rolActual} onSwitch={onSwitchRole} onHome={onHome} />
        )}

        <div className="flex items-center gap-3 rounded-full border border-[#2A2A2A] bg-[#161616] px-5 py-3">
          <span className="h-3 w-3 rounded-full bg-[#A30F0A] shadow-[0_0_10px_rgba(163,15,10,0.8)]" />
          <span className="text-sm font-semibold text-white">{usuario?.nombre ?? 'Abogado HG'}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide text-white/55">
            {usuario?.rol ?? 'ABOGADO'}
          </span>
        </div>
      </div>
    </header>
  )
}
