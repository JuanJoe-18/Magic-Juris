import { useReveal } from '../../hooks/useReveal'

// Envoltorio que aplica la animación de aparición al entrar en viewport.
export default function Reveal({
  children,
  delay = 0,
  as: Tag = 'div',
  className = '',
}) {
  const [ref, visible] = useReveal()
  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal ${visible ? 'reveal-in' : ''} ${className}`}
    >
      {children}
    </Tag>
  )
}
