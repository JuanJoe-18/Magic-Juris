import { Phone, Mail, MapPin } from 'lucide-react'

// Pie de página con identidad HG.
export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-hg-bg">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        {/* marca */}
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.1] bg-hg-surface2 font-sora text-base font-extrabold">
              H<span className="text-hg-red">G</span>
            </span>
            <span className="leading-none">
              <span className="block font-sora text-sm font-bold tracking-wide">
                MagicJuris
              </span>
              <span className="block text-[10px] uppercase tracking-[0.18em] text-white/40">
                by Hurtado Gandini
              </span>
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
            Sistema de seguimiento judicial y atención proactiva al cliente.
            Desarrollado para el Legal Hack Icesi 2026 — Reto 3.
          </p>
        </div>

        {/* navegación */}
        <div>
          <p className="font-sora text-sm font-semibold text-white/80">Producto</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/45">
            <li><a href="#features" className="transition-colors hover:text-white">Capacidades</a></li>
            <li><a href="#how" className="transition-colors hover:text-white">Cómo funciona</a></li>
            <li><a href="#roles" className="transition-colors hover:text-white">Roles</a></li>
            <li><a href="#security" className="transition-colors hover:text-white">Seguridad</a></li>
          </ul>
        </div>

        {/* contacto */}
        <div>
          <p className="font-sora text-sm font-semibold text-white/80">Contacto</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/45">
            <li className="flex items-center gap-2">
              <Phone size={14} className="text-hg-red" /> (57) 310 041 7827
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="text-hg-red" /> contacto@hgabao.com
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={14} className="text-hg-red" /> Cali, Colombia
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-white/35 md:flex-row md:px-8">
          <p>© 2026 Hurtado Gandini Abogados S.A.S. · Prototipo MVP.</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/70" />
            Conforme a Ley 1581 de 2012
          </p>
        </div>
      </div>
    </footer>
  )
}
