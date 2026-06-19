import { useState } from 'react'
import Landing from './pages/Landing'
import AbogadoDashboard from './pages/AbogadoDashboard'
import ClienteDashboard from './pages/ClienteDashboard'
import AdminDashboard from './pages/AdminDashboard'
import { MockProvider } from './context/MockContext'

function App() {
  const [currentView, setCurrentView] = useState('landing')

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onEnter={(role) => setCurrentView(typeof role === 'string' ? role : 'abogado')} />
      case 'abogado':
        return (
          <AbogadoDashboard
            onHome={() => setCurrentView('landing')}
            onNavigate={setCurrentView}
          />
        )
      case 'cliente':
        return (
          <ClienteDashboard
            onHome={() => setCurrentView('landing')}
            onNavigate={setCurrentView}
          />
        )
      case 'admin':
        return (
          <AdminDashboard
            onHome={() => setCurrentView('landing')}
            onNavigate={setCurrentView}
          />
        )
      default:
        return <Landing onEnter={(role) => setCurrentView(typeof role === 'string' ? role : 'abogado')} />
    }
  }

  return (
    <MockProvider>
      <div className="min-h-screen bg-hg-bg text-white font-inter selection:bg-hg-red/30">
        {renderView()}
      </div>
    </MockProvider>
  )
}

export default App
