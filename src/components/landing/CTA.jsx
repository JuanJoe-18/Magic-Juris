import { ArrowRight, Gavel } from 'lucide-react'
import Reveal from './Reveal'

// Llamado a la acción final con borde luminoso y aurora.
export default function CTA({ onEnter }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <Reveal className="border-glow relative overflow-hidden rounded-3xl border border-white/[0.08] bg-hg-surface/60 px-6 py-16 text-center md:py-20">
        {/* auroras */}
        <div
          className="aurora-blob -left-10 -top-10 h-72 w-72"
          style={{ background: 'radial-gradient(circle, rgba(197,32,46,0.4), transparent 65%)' }}
        />
        <div
          className="aurora-blob -bottom-10 -right-10 h-72 w-72"
          style={{ background: 'radial-gradient(circle, rgba(26,92,138,0.35), transparent 65%)', animationDelay: '-8s' }}
        />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl font-sora text-3xl font-extrabold tracking-tight md:text-5xl">
            Que ningún término
            <br />
            <span className="text-shimmer">vuelva a vencerse.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-white/55">
            Explora el dashboard del abogado con datos reales de demostración y
            descubre cómo se siente tener el expediente vigilándose solo.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onEnter}
              className="group inline-flex items-center gap-2 rounded-xl bg-hg-red px-7 py-4 font-semibold text-white anim-glow transition-transform hover:scale-[1.02]"
            >
              <Gavel size={18} />
              Entrar al demo
              <ArrowRight
                size={18}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
            <span className="text-xs text-white/40">
              Sin registro · datos ficticios
            </span>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
