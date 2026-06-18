import { useEffect } from 'react'

// Glow radial sutil que sigue el cursor por toda la landing.
export default function Spotlight() {
  useEffect(() => {
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--spot-x', `${e.clientX}px`)
        document.documentElement.style.setProperty('--spot-y', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[5] hidden md:block"
      style={{
        background:
          'radial-gradient(520px circle at var(--spot-x) var(--spot-y), rgba(197,32,46,0.07), transparent 45%)',
      }}
    />
  )
}
