import {
  LayoutDashboard,
  BellRing,
  FolderKanban,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'

// Mockup estilizado del dashboard que flota en 3D dentro del hero.
// Reproduce el lenguaje visual de la app real (sidebar, alerta, tarjetas, badges).
export default function HeroMock() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-hg-surface/90 shadow-2xl">
      {/* línea de escaneo */}
      <span className="anim-scan pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-hg-red/20 to-transparent" />

      {/* barra de ventana */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-hg-red/70" />
        <span className="ml-3 font-mono text-[10px] text-white/30">
          magicjuris.app/abogado
        </span>
      </div>

      <div className="flex">
        {/* mini sidebar */}
        <div className="hidden w-[88px] shrink-0 flex-col gap-3 border-r border-white/[0.06] p-3 sm:flex">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-hg-surface2 font-sora text-[11px] font-bold">
              H<span className="text-hg-red">G</span>
            </span>
          </div>
          {[LayoutDashboard, FolderKanban, BellRing, ShieldCheck].map((Icon, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${
                i === 0 ? 'bg-white/[0.06]' : ''
              }`}
            >
              <Icon size={15} className={i === 0 ? 'text-white' : 'text-white/35'} />
              <span className="h-1.5 w-7 rounded-full bg-white/10" />
            </div>
          ))}
        </div>

        {/* contenido */}
        <div className="flex-1 space-y-3 p-4">
          {/* banner de alerta crítica */}
          <div
            className="layer-3d flex items-center justify-between rounded-xl border px-3 py-2"
            style={{
              borderColor: 'rgba(197,32,46,0.35)',
              background:
                'linear-gradient(180deg, rgba(197,32,46,0.12), rgba(197,32,46,0.03))',
            }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-hg-red/20 anim-glow">
                <BellRing size={12} className="text-hg-red" />
              </span>
              <span className="text-[11px] font-medium text-white/80">
                3 actuaciones críticas hoy
              </span>
            </div>
            <span className="rounded-full bg-hg-red px-2 py-0.5 text-[10px] font-bold tabular-nums">
              2d 4h
            </span>
          </div>

          {/* tarjetas de proceso */}
          {[
            { c: 'Inversiones del Pacífico', crit: '#C5202E', label: 'Crítica', est: 'E2' },
            { c: 'Carlos A. Restrepo M.', crit: '#B8621A', label: 'Importante', est: 'E3' },
            { c: 'Distribuciones Caribe', crit: '#1A5C8A', label: 'Informativa', est: 'E3' },
          ].map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5"
              style={{ transform: `translateZ(${20 - i * 6}px)` }}
            >
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-white/85">
                  {p.c}
                </p>
                <p className="font-mono text-[9px] text-white/30">
                  1100131030052024…
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-white/[0.05] px-1.5 py-0.5 font-sora text-[9px] font-bold text-hg-red">
                  {p.est}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-white"
                  style={{
                    backgroundColor: p.crit,
                    boxShadow: `0 0 10px ${p.crit}88`,
                  }}
                >
                  {p.label}
                </span>
              </div>
            </div>
          ))}

          {/* resumen IA */}
          <div className="layer-3d flex items-start gap-2 rounded-xl bg-hg-surface2/70 p-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-hg-red/30 bg-hg-red/15">
              <Sparkles size={12} className="text-hg-red" />
            </span>
            <div className="space-y-1.5 pt-0.5">
              <span className="block h-1.5 w-40 rounded-full bg-white/15" />
              <span className="block h-1.5 w-28 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
