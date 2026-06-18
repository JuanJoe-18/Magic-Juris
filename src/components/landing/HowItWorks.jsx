import { FilePlus2, Radar, Layers3, Send } from 'lucide-react'
import Reveal from './Reveal'

// Flujo de 4 pasos con conector vertical luminoso.
const steps = [
  {
    icon: FilePlus2,
    n: '01',
    title: 'Registrar el radicado',
    desc: 'El abogado autenticado ingresa el radicado de 23 dígitos y lo asocia a un cliente. El sistema valida el formato y comienza a monitorear.',
  },
  {
    icon: Radar,
    n: '02',
    title: 'Vigilancia continua',
    desc: 'Consulta periódica a la fuente oficial con reintentos y retroceso exponencial. Ninguna actuación se pierde aunque el portal falle.',
  },
  {
    icon: Layers3,
    n: '03',
    title: 'Clasificar y contextualizar',
    desc: 'Cada novedad se ubica en el modelo de estados, se clasifica por criticidad y se calcula la antelación de la alerta.',
  },
  {
    icon: Send,
    n: '04',
    title: 'Comunicar de forma proactiva',
    desc: 'Se genera el resumen adecuado a cada rol y se notifica por los canales configurados, dejando registro auditable de todo.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="relative mx-auto max-w-5xl px-5 py-20 md:px-8">
      <Reveal className="text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-hg-red">
          Cómo funciona
        </span>
        <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight md:text-4xl">
          Del radicado a la tranquilidad
        </h2>
      </Reveal>

      <div className="relative mt-14">
        {/* línea conectora */}
        <div className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-hg-red/60 via-white/10 to-transparent md:left-1/2" />

        <div className="space-y-6">
          {steps.map((s, i) => {
            const Icon = s.icon
            const right = i % 2 === 1
            return (
              <Reveal
                key={s.n}
                delay={i * 90}
                className={`relative flex items-start gap-5 md:w-1/2 ${
                  right ? 'md:ml-auto md:flex-row-reverse md:text-right' : ''
                }`}
              >
                {/* nodo */}
                <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/[0.1] bg-hg-surface shadow-lg">
                  <Icon size={22} className="text-hg-red" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-hg-red font-sora text-[9px] font-bold">
                    {i + 1}
                  </span>
                </div>
                <div className="hg-glass flex-1 rounded-2xl p-5">
                  <p className="font-mono text-xs text-hg-red">{s.n}</p>
                  <h3 className="mt-1 font-sora text-lg font-semibold">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {s.desc}
                  </p>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
