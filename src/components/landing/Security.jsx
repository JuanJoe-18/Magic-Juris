import { ShieldCheck, Lock, ScrollText, EyeOff, Scale, ServerCog } from 'lucide-react'
import Reveal from './Reveal'

// Sección de cumplimiento legal y seguridad.
const items = [
  { icon: Scale, title: 'Consulta a demanda', desc: 'Solo procesos registrados por un abogado autenticado. Sin recolección masiva (precedente SIC 58834/2023).' },
  { icon: ShieldCheck, title: 'Ley 1581 — Habeas Data', desc: 'Finalidad declarada, minimización y mecanismos de acceso, rectificación y supresión.' },
  { icon: EyeOff, title: 'Anonimización ante IA', desc: 'Seudonimización de datos de terceros antes de enviar texto a LLMs externos.' },
  { icon: Lock, title: 'Cifrado extremo', desc: 'TLS 1.2+ en tránsito y cifrado en reposo. Acceso controlado por roles (RBAC).' },
  { icon: ScrollText, title: 'Registro inalterable', desc: 'Historial de comunicaciones append-only con valor probatorio y exportable.' },
  { icon: ServerCog, title: 'Resiliencia', desc: 'Reintentos con retroceso exponencial y extracción adaptativa ante cambios del portal.' },
]

export default function Security() {
  return (
    <section
      id="security"
      className="relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-20"
    >
      {/* blob de fondo */}
      <div
        className="aurora-blob left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2"
        style={{ background: 'radial-gradient(circle, rgba(26,92,138,0.25), transparent 65%)' }}
      />
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-hg-red">
            Cumplimiento por diseño
          </span>
          <h2 className="mt-3 font-sora text-3xl font-bold tracking-tight md:text-4xl">
            Confiable ante el cliente y ante la SIC
          </h2>
          <p className="mt-4 text-white/55">
            El diferenciador no es solo monitorear: es hacerlo de forma legal,
            trazable y defendible.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const Icon = it.icon
            return (
              <Reveal
                key={it.title}
                delay={i * 70}
                className="flex items-start gap-4 rounded-2xl border border-white/[0.07] bg-hg-surface/50 p-5 transition-colors hover:border-white/[0.14]"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                  <Icon size={18} className="text-emerald-300/80" />
                </span>
                <div>
                  <h3 className="font-sora text-[15px] font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {it.desc}
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
