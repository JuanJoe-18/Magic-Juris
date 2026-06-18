import { useEffect } from 'react'
import Spotlight from '../components/landing/Spotlight'
import Nav from '../components/landing/Nav'
import Hero from '../components/landing/Hero'
import Marquee from '../components/landing/Marquee'
import Stats from '../components/landing/Stats'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Roles from '../components/landing/Roles'
import Security from '../components/landing/Security'
import CTA from '../components/landing/CTA'
import Footer from '../components/landing/Footer'

// Landing de producto de vanguardia para MagicJuris (by Hurtado Gandini).
// `onEnter` lleva al dashboard del abogado.
export default function Landing({ onEnter }) {
  // Deep-linking: si se llega con un hash (#features, #roles…), posiciona
  // la sección correspondiente tras el montaje.
  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    let el = null
    try {
      el = document.querySelector(hash)
    } catch {
      return
    }
    if (el) {
      const t = setTimeout(() => {
        el.scrollIntoView({ block: 'start' })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div className="relative bg-hg-bg">
      <Spotlight />
      <Nav onEnter={onEnter} />
      <main>
        <Hero onEnter={onEnter} />
        <Marquee />
        <Stats />
        <Features />
        <HowItWorks />
        <Roles />
        <Security />
        <CTA onEnter={onEnter} />
      </main>
      <Footer />
    </div>
  )
}
