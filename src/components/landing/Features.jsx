import {
  Radar,
  Layers,
  Sparkles,
  BellRing,
  ShieldCheck,
  FileLock2,
} from 'lucide-react'
import TiltCard from './TiltCard'
import Reveal from './Reveal'

// Sección de capacidades — tarjetas con tilt 3D interactivo.
const features = [
  {
    icon: Radar,
    title: 'Monitoreo automatizado',
    desc: 'Consulta a demanda sobre cada radicado registrado y detecta nuevas actuaciones por diferencia contra el último estado conocido.',
    tags: ['RF-13', 'RF-15'],
    accent: '#C5202E',
  },
  {
    icon: Layers,
    title: 'Clasificación por criticidad',
    desc: 'Cada actuación se mapea al modelo de estados E0–E4 y se clasifica en Crítica, Importante o Informativa para priorizar.',
    tags: ['RF-18', 'RF-20'],
    accent: '#B8621A',
  },
  {
    icon: Sparkles,
    title: 'Resúmenes IA por rol',
    desc: 'Un mismo hecho procesal, tres lenguajes: claro para el cliente, técnico para el abogado, ejecutivo para administración.',
    tags: ['RF-21', 'RF-23'],
    accent: '#1A5C8A',
  },
  {
    icon: BellRing,
    title: 'Alertas con cuenta regresiva',
    desc: 'Antelación configurable por nivel de criticidad. El reloj procesal no se detiene; las alertas tampoco.',
    tags: ['RF-26', 'RF-19'],
    accent: '#C5202E',
  },
  {
    icon: ShieldCheck,
    title: 'Habeas Data desde el diseño',
    desc: 'Minimización de datos, finalidad declarada y anonimización antes de enviar texto a IA generativa de terceros.',
    tags: ['RF-25', 'RF-37'],
    accent: '#1A5C8A',
  },
  {
    icon: FileLock2,
    title: 'Trazabilidad append-only',
    desc: 'Registro inalterable de qué se comunicó, a quién y cuándo. Valor probatorio para auditorías internas y ante la SIC.',
    tags: ['RF-30', 'RF-34'],
    accent: '#B8621A',
  },
]

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-5 py-20 md:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-hg-red">
          Capacidades
        </span>
        <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight md:text-4xl">
          Todo el expediente, bajo control
        </h2>
        <p className="mt-4 text-white/55">
          Seis módulos que convierten la consulta manual en vigilancia
          proactiva, trazable y conforme a la ley.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => {
          const Icon = f.icon
          return (
            <Reveal key={f.title} delay={i * 80}>
              <TiltCard
                max={10}
                className="h-full"
                innerClassName="h-full rounded-2xl"
              >
                <div className="border-glow group relative h-full overflow-hidden rounded-2xl border border-white/[0.07] bg-hg-surface/60 p-6 backdrop-blur-sm transition-colors hover:bg-hg-surface/90">
                  {/* halo del icono */}
                  <div
                    className="layer-3d mb-5 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: `${f.accent}1f`,
                      boxShadow: `0 0 24px ${f.accent}33`,
                    }}
                  >
                    <Icon size={22} style={{ color: f.accent }} />
                  </div>
                  <h3 className="layer-3d font-sora text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    {f.desc}
                  </p>
                  <div className="mt-5 flex gap-2">
                    {f.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-white/45"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
