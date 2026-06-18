import { useRef } from 'react'
import { ArrowRight, Sparkles, Gavel, ShieldCheck } from 'lucide-react'
import TiltCard from './TiltCard'
import HeroMock from './HeroMock'

// Hero principal: aurora animada + grid en perspectiva + parallax de cursor
// + mockup 3D flotante del dashboard.
export default function Hero({ onEnter }) {
  const rootRef = useRef(null)
  const raf = useRef(0)

  // Parallax: traslada las capas según la posición del cursor.
  const handleMove = (e) => {
    const el = rootRef.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      el.style.setProperty('--px', px.toFixed(3))
      el.style.setProperty('--py', py.toFixed(3))
    })
  }

  return (
    <section
      id="top"
      ref={rootRef}
      onMouseMove={handleMove}
      className="relative min-h-screen overflow-hidden pt-28 pb-16 md:pt-36"
    >
      {/* ── Capa de fondo: aurora ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="aurora-blob h-[520px] w-[520px] -left-32 -top-24"
          style={{
            background:
              'radial-gradient(circle, rgba(197,32,46,0.55), transparent 65%)',
            transform: 'translate(calc(var(--px,0)*40px), calc(var(--py,0)*40px))',
          }}
        />
        <div
          className="aurora-blob right-0 top-10 h-[460px] w-[460px]"
          style={{
            background:
              'radial-gradient(circle, rgba(26,92,138,0.45), transparent 65%)',
            animationDelay: '-6s',
            transform: 'translate(calc(var(--px,0)*-50px), calc(var(--py,0)*-30px))',
          }}
        />
        <div
          className="aurora-blob bottom-0 left-1/3 h-[380px] w-[380px]"
          style={{
            background:
              'radial-gradient(circle, rgba(184,98,26,0.30), transparent 65%)',
            animationDelay: '-12s',
          }}
        />
      </div>

      {/* ── Grid en perspectiva ── */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[55%]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          transform: 'perspective(420px) rotateX(58deg)',
          transformOrigin: 'bottom',
          maskImage:
            'linear-gradient(to top, #000 0%, transparent 85%)',
          WebkitMaskImage:
            'linear-gradient(to top, #000 0%, transparent 85%)',
        }}
      />
      {/* viñeta superior para fundir con el nav */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-hg-bg to-transparent" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-[1.05fr_1fr]">
        {/* ── Columna de copy ── */}
        <div
          style={{
            transform:
              'translate(calc(var(--px,0)*-14px), calc(var(--py,0)*-14px))',
          }}
        >
          {/* badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-3.5 py-1.5 text-xs text-white/70 backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-hg-red anim-glow" />
            Legal Hack Icesi 2026 · Reto 3
          </div>

          <h1 className="font-sora text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            El expediente
            <br />
            que se vigila
            <br />
            <span className="text-shimmer">a sí mismo.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 md:text-lg">
            Monitoreo judicial automatizado para{' '}
            <span className="text-white/80">Hurtado Gandini</span>. Detectamos
            cada actuación en la Rama Judicial, la clasificamos por criticidad y
            la traducimos a tres lenguajes — cliente, abogado y administración —
            sin dejar vencer un solo término.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-2 rounded-xl bg-hg-red px-6 py-3.5 font-semibold text-white anim-glow transition-transform hover:scale-[1.02]"
            >
              <Gavel size={18} />
              Explorar el dashboard
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.03] px-6 py-3.5 font-medium text-white/80 backdrop-blur transition-colors hover:bg-white/[0.07]"
            >
              <Sparkles size={18} className="text-hg-red" />
              Cómo funciona
            </a>
          </div>

          {/* mini prueba social */}
          <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-white/45">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-400/70" />
              Habeas Data · Ley 1581
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              Consulta a demanda (SIC)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1 w-1 rounded-full bg-white/30" />
              Trazabilidad append-only
            </span>
          </div>
        </div>

        {/* ── Columna del mockup 3D ── */}
        <div
          className="relative anim-float"
          style={{
            transform:
              'translate(calc(var(--px,0)*26px), calc(var(--py,0)*22px))',
          }}
        >
          {/* anillos orbitales */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2">
            <div className="anim-spin-slow absolute inset-0 rounded-full border border-white/[0.06]" />
            <div className="anim-spin-rev absolute inset-8 rounded-full border border-hg-red/15" />
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-hg-red shadow-[0_0_12px_rgba(197,32,46,0.8)]" />
          </div>

          <TiltCard max={8} innerClassName="rounded-2xl">
            <HeroMock />
          </TiltCard>

          {/* badges flotantes */}
          <div
            className="anim-float-slow absolute -left-4 top-12 hidden rounded-xl border border-white/[0.1] bg-hg-surface/90 px-3 py-2 shadow-xl backdrop-blur sm:block"
            style={{ transform: 'translate(calc(var(--px,0)*-30px), 0)' }}
          >
            <p className="text-[10px] text-white/40">Detección</p>
            <p className="text-sm font-bold text-white">&lt; 4 h</p>
          </div>
          <div
            className="anim-float absolute -right-3 bottom-16 hidden rounded-xl border border-white/[0.1] bg-hg-surface/90 px-3 py-2 shadow-xl backdrop-blur sm:block"
            style={{ transform: 'translate(calc(var(--px,0)*30px), 0)' }}
          >
            <p className="text-[10px] text-white/40">Resumen IA</p>
            <p className="text-sm font-bold text-emerald-400/90">Listo ✓</p>
          </div>
        </div>
      </div>
    </section>
  )
}
