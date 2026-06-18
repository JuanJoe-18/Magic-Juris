import { useEffect, useState } from 'react'
import { ArrowRight, Scale } from 'lucide-react'

const links = [
  { label: 'Producto', href: '#features' },
  { label: 'Cómo funciona', href: '#how' },
  { label: 'Roles', href: '#roles' },
  { label: 'Seguridad', href: '#security' },
]

// Barra de navegación fija con efecto glass al hacer scroll.
export default function Nav({ onEnter }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/[0.08] bg-hg-bg/70 backdrop-blur-xl'
          : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-3">
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
        </a>

        {/* Links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm text-white/60 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEnter}
            className="hidden rounded-xl px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:text-white sm:block"
          >
            Ingresar
          </button>
          <button
            onClick={onEnter}
            className="group inline-flex items-center gap-1.5 rounded-xl bg-hg-red px-4 py-2 text-sm font-semibold text-white shadow-[0_0_24px_rgba(197,32,46,0.45)] transition-all hover:shadow-[0_0_32px_rgba(197,32,46,0.7)]"
          >
            <Scale size={15} />
            Ver demo
            <ArrowRight
              size={15}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </button>
        </div>
      </nav>
    </header>
  )
}
