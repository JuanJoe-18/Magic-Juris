import { useRef } from 'react'

// Tarjeta con inclinación 3D interactiva que sigue el cursor.
// `max` = grados máximos de rotación · `glare` = brillo radial que sigue el mouse.
export default function TiltCard({
  children,
  className = '',
  innerClassName = '',
  max = 9,
  glare = true,
}) {
  const ref = useRef(null)
  const raf = useRef(0)

  const handleMove = (e) => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    raf.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width
      const py = (e.clientY - r.top) / r.height
      el.style.setProperty('--rx', `${((0.5 - py) * max * 2).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${((px - 0.5) * max * 2).toFixed(2)}deg`)
      el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`)
    })
  }

  const reset = () => {
    const el = ref.current
    if (!el) return
    cancelAnimationFrame(raf.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }

  return (
    <div className={`tilt ${className}`}>
      <div
        ref={ref}
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className={`tilt-inner ${innerClassName}`}
      >
        {children}
        {glare && <span className="tilt-glare" />}
      </div>
    </div>
  )
}
