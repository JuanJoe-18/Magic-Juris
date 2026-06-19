import { UserRound, Scale, Building2, ArrowRight } from 'lucide-react'
import TiltCard from './TiltCard'
import Reveal from './Reveal'

// "Un mismo hecho procesal, tres lenguajes": muestra el mismo evento
// traducido para Cliente, Abogado y Administración.
const roles = [
  {
    icon: UserRound,
    role: 'Cliente',
    id: 'cliente',
    color: '#1A5C8A',
    tone: 'Lenguaje claro',
    text: 'Su caso avanza bien. El juez citó a una reunión formal para el 22 de junio; su asistencia es importante. Nosotros preparamos todo.',
  },
  {
    icon: Scale,
    role: 'Abogado',
    id: 'abogado',
    color: '#C5202E',
    tone: 'Técnico-jurídico',
    text: 'E2 · Apertura. Audiencia inicial art. 372 CGP fijada 22/06 09:00. Verificar poder, preparar interrogatorio y fijación de hechos. Inasistencia: consecuencias procesales.',
  },
  {
    icon: Building2,
    role: 'Administración',
    id: 'admin',
    color: '#B8621A',
    tone: 'Ejecutivo',
    text: 'Cartera: 1 audiencia crítica esta semana (Inversiones del Pacífico). Comunicación al cliente registrada y trazada. Sin términos en riesgo.',
  },
]

export default function Roles({ onEnter }) {
  return (
    <section id="roles" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-hg-red">
          Experiencia por rol
        </span>
        <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight md:text-4xl">
          Un hecho procesal,{' '}
          <span className="text-gradient-hg">tres lenguajes</span>
        </h2>
        <p className="mt-4 text-white/55">
          La misma fijación de audiencia, contada como cada destinatario la
          necesita entender.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {roles.map((r, i) => {
          const Icon = r.icon
          return (
            <Reveal key={r.role} delay={i * 100}>
              <TiltCard max={8} className="h-full" innerClassName="h-full rounded-2xl">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onEnter?.(r.id)}
                  onKeyDown={(e) =>
                    (e.key === 'Enter' || e.key === ' ') && onEnter?.(r.id)
                  }
                  className="group/role relative h-full cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-hg-surface/70 p-6 transition-colors hover:border-white/20"
                >
                  {/* franja de color del rol */}
                  <span
                    className="absolute inset-x-0 top-0 h-1"
                    style={{ background: r.color }}
                  />
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{ background: `${r.color}22` }}
                    >
                      <Icon size={20} style={{ color: r.color }} />
                    </span>
                    <div>
                      <p className="font-sora font-semibold">{r.role}</p>
                      <p className="text-[11px] uppercase tracking-wider text-white/40">
                        {r.tone}
                      </p>
                    </div>
                  </div>

                  {/* burbuja de mensaje */}
                  <div className="mt-5 rounded-xl rounded-tl-sm bg-white/[0.04] p-4">
                    <p className="text-sm leading-relaxed text-white/75">
                      {r.text}
                    </p>
                  </div>

                  {/* Acceso al dashboard del rol */}
                  <span
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
                    style={{ color: r.color }}
                  >
                    Entrar como {r.role}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover/role:translate-x-1"
                    />
                  </span>
                </div>
              </TiltCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
