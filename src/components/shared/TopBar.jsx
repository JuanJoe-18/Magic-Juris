import { Bell, Mail } from 'lucide-react'

import RoleSwitcher from './RoleSwitcher'

export function LogoHG({ onHome }) {
  return (
    <button
      onClick={onHome}
      title="Volver al inicio"
      className="flex items-center gap-5 text-left transition-opacity hover:opacity-80"
    >
      <span className="relative flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#111111]">
        <span className="absolute left-0 right-0 top-1/2 h-[5px] -translate-y-1/2 bg-[#84120C]" />
        <span className="relative font-sora text-[2.1rem] font-extrabold leading-none tracking-[-0.12em] text-white">
          HG
        </span>
      </span>

      <span className="flex flex-col">
        <span className="font-sora text-2xl font-semibold uppercase leading-none tracking-tight text-white">
          Hurtado
        </span>
        <span className="mt-0.5 font-sora text-2xl font-semibold uppercase leading-none tracking-tight text-white">
          Gandini
        </span>
      </span>
    </button>
  )
}

export default function TopBar({
  titulo,
  subtitulo = 'Sistema de seguimiento judicial',
  onHome,
  usuario,
  mostrarCampana = false,
  rolActual,
  onSwitchRole,
  variant = 'default',
  showRoleSwitcher = true,
}) {
  const isClient = variant === 'client'

  return (
    <header
      className={`border-b border-white/10 pb-4 ${
        isClient
          ? 'flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'
          : 'flex items-center justify-between gap-4 px-1 py-2'
      }`}
    >
      <div className="flex items-center gap-6">
        <LogoHG onHome={onHome} />
        {isClient && <div className="hidden h-14 w-px bg-white/10 lg:block" />}
      </div>

      <div className={`min-w-0 flex-1 ${isClient ? 'lg:px-2' : 'text-center'}`}>
        <p className="text-[12px] font-medium tracking-wide text-[#D9D9D9]">{subtitulo}</p>
        <h2
          className={`truncate font-sora font-bold text-white ${
            isClient ? 'mt-1 text-[2rem] md:text-[2.35rem]' : 'text-base md:text-lg'
          }`}
        >
          {titulo}
        </h2>
      </div>

      <div className={`flex ${isClient ? 'justify-end' : 'flex-col items-end gap-1.5'}`}>
        <div className="flex items-center gap-3">
          {onSwitchRole && showRoleSwitcher && (
            <RoleSwitcher actual={rolActual} onSwitch={onSwitchRole} onHome={onHome} />
          )}

          {mostrarCampana && (
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2A2A2A] bg-[#161616] text-white/70 transition-colors hover:text-white"
              title="Notificaciones"
            >
              <Bell size={16} />
            </button>
          )}

          <div
            className={`rounded-[20px] border border-[#2A2A2A] bg-[#161616] ${
              isClient ? 'min-w-[250px] px-5 py-3' : 'px-4 py-2'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#A30F0A] shadow-[0_0_10px_rgba(163,15,10,0.8)]" />
              {usuario?.nombre && (
                <span className="text-sm font-semibold text-white">{usuario.nombre}</span>
              )}
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/55">
                {usuario?.rol ?? ''}
              </span>
            </div>

            {usuario?.email && (
              <span className="mt-3 inline-flex items-center gap-2 text-[13px] text-white/70">
                <Mail size={14} /> {usuario.email}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
