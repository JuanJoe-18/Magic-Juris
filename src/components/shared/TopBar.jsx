import { Bell, Mail } from 'lucide-react'
import RoleSwitcher from './RoleSwitcher'

// ── Logo HG con el trazo rojo característico ──
export function LogoHG({ onHome }) {
  return (
    <button
      onClick={onHome}
      title="Volver al inicio"
      className="flex items-center gap-3 text-left transition-opacity hover:opacity-80"
    >
      <span className="relative font-sora text-3xl font-extrabold leading-none tracking-tight text-white">
        HG
        <span className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 -rotate-12 rounded bg-[#84120C]" />
      </span>
      <span className="hidden font-sora text-sm font-semibold uppercase leading-tight tracking-[0.12em] text-white/90 sm:block">
        Hurtado
        <br />
        Gandini
      </span>
    </button>
  )
}

// ── Encabezado superior genérico (Abogado / Cliente / Admin) ──
export default function TopBar({
  titulo,
  subtitulo = 'Sistema de seguimiento judicial',
  onHome,
  usuario, // { nombre?, rol, email? }
  mostrarCampana,
  rolActual, // 'abogado' | 'cliente' | 'admin'
  onSwitchRole,
}) {
  return (
    <header className="flex items-center justify-between gap-4 px-1 py-2">
      <LogoHG onHome={onHome} />

      <div className="min-w-0 flex-1 text-center">
        <p className="text-[12px] font-medium tracking-wide text-white/45">{subtitulo}</p>
        <h2 className="truncate font-sora text-base font-bold text-white md:text-lg">
          {titulo}
        </h2>
      </div>

      <div className="flex flex-col items-end gap-1.5">
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
            {usuario?.nombre && (
              <span className="text-sm font-semibold text-white">{usuario.nombre}</span>
            )}
            <span className="text-[11px] font-semibold tracking-wide text-white/55">
              {usuario?.rol ?? ''}
            </span>
          </div>
        </div>
        {usuario?.email && (
          <span className="inline-flex items-center gap-1.5 pr-1 text-[12px] text-white/55">
            <Mail size={13} /> {usuario.email}
          </span>
        )}
      </div>
    </header>
  )
}
