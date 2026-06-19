import { useState } from 'react'
import { ChevronDown, Scale, UserRound, Building2, Home } from 'lucide-react'

const roles = [
  { id: 'abogado', label: 'Abogado', icon: Scale },
  { id: 'cliente', label: 'Cliente', icon: UserRound },
  { id: 'admin', label: 'Administración', icon: Building2 },
]

// ── Selector de rol: salta entre Abogado / Cliente / Admin / Inicio ──
export default function RoleSwitcher({ actual, onSwitch, onHome }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-[12px] font-semibold text-white/70 transition-colors hover:text-white"
        title="Cambiar de rol"
      >
        Cambiar rol
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Capa para cerrar al hacer click afuera */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#161616] shadow-2xl">
            <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
              Ver como
            </p>
            {roles.map(({ id, label, icon: Icon }) => {
              const activo = actual === id
              return (
                <button
                  key={id}
                  onClick={() => {
                    setOpen(false)
                    if (!activo) onSwitch?.(id)
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#202020] ${
                    activo ? 'text-white' : 'text-white/65'
                  }`}
                >
                  <Icon size={15} className={activo ? 'text-[#A30F0A]' : ''} />
                  {label}
                  {activo && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#A30F0A]" />
                  )}
                </button>
              )
            })}
            <div className="my-1 border-t border-[#262626]" />
            <button
              onClick={() => {
                setOpen(false)
                onHome?.()
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-white/65 transition-colors hover:bg-[#202020]"
            >
              <Home size={15} /> Volver al inicio
            </button>
          </div>
        </>
      )}
    </div>
  )
}
