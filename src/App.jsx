import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import AbogadoDashboard from './pages/AbogadoDashboard'

// Punto de ensamblaje de la aplicación.
// MVP Reto 3 — landing de producto + vista del rol Abogado.
// (Próximas vistas: Cliente y Admin.)
export default function App() {
  const [view, setView] = useState('landing') // 'landing' | 'abogado'

  // Vuelve al tope al cambiar de vista.
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

  if (view === 'abogado') {
    return <AbogadoDashboard onHome={() => setView('landing')} />
  }
  return <Landing onEnter={() => setView('abogado')} />
}
