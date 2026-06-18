import { useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  BellRing,
  History,
  Settings,
  UserRound,
} from 'lucide-react'

// ── Barra lateral de navegación con identidad HG ──
// Fija de 260px en escritorio; colapsa a iconos en móvil.
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'procesos', label: 'Mis Procesos', icon: FolderKanban },
  { id: 'alertas', label: 'Alertas', icon: BellRing },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'config', label: 'Configuración', icon: Settings },
]

export default function Sidebar({ abogado, alertasCriticas, onHome }) {
  const [activo, setActivo] = useState('dashboard')

  return (
    <aside
      className="hg-glass fixed left-0 top-0 z-30 flex h-screen flex-col
                 w-[72px] md:w-[260px] shrink-0 border-r border-white/[0.08]
                 transition-[width] duration-200"
    >
      {/* Logo (vuelve a la landing) */}
      <button
        onClick={onHome}
        title="Volver al inicio"
        className="flex items-center gap-3 px-4 py-6 text-left transition-opacity hover:opacity-80 md:px-6"
      >
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl
                     bg-hg-surface2 border border-white/[0.08] font-sora font-bold text-lg"
        >
          H<span className="text-hg-red">G</span>
        </div>
        <div className="hidden md:block leading-tight">
          <p className="font-sora font-bold tracking-wide">Hurtado Gandini</p>
          <p className="text-[11px] text-white/40">Seguimiento Judicial</p>
        </div>
      </button>

      {/* Navegación */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {navItems.map(({ id, label, icon: Icon }) => {
          const isActive = activo === id
          const isAlertas = id === 'alertas'
          return (
            <button
              key={id}
              onClick={() => setActivo(id)}
              title={label}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5
                         text-sm font-medium transition-colors
                         ${
                           isActive
                             ? 'bg-white/[0.06] text-white'
                             : 'text-white/55 hover:bg-white/[0.03] hover:text-white/90'
                         }`}
            >
              {/* Indicador de activo */}
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r bg-hg-red" />
              )}
              <Icon size={20} className="shrink-0" />
              <span className="hidden md:inline">{label}</span>

              {/* Contador de alertas críticas pendientes */}
              {isAlertas && alertasCriticas > 0 && (
                <span
                  className="ml-auto hidden md:flex h-5 min-w-5 items-center justify-center
                             rounded-full bg-hg-red px-1.5 text-[11px] font-semibold text-white
                             animate-pulse-critical"
                >
                  {alertasCriticas}
                </span>
              )}
              {/* En móvil el contador se muestra como punto */}
              {isAlertas && alertasCriticas > 0 && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-hg-red md:hidden" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Indicador de rol activo */}
      <div className="border-t border-white/[0.08] p-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-hg-surface2 border border-white/[0.08]">
            <UserRound size={18} className="text-white/70" />
          </div>
          <div className="hidden md:block leading-tight">
            <p className="text-sm font-medium">{abogado?.nombre ?? 'Abogado'}</p>
            <p className="text-[11px] text-hg-red font-medium">
              Rol: {abogado?.rol ?? 'Abogado'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
