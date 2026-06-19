import { useState } from 'react'
import Landing from './pages/Landing'
import AbogadoDashboard from './pages/AbogadoDashboard'
import ClienteDashboard from './pages/ClienteDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import { MockProvider } from './context/MockContext'
import { AuthProvider } from './context/AuthContext'

function App() {
  const [currentView, setCurrentView] = useState('landing')

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onEnter={(role) => setCurrentView(typeof role === 'string' ? role : 'login')} />
      case 'login':
        return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
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
      case 'administrativo':
        return (
          <AdminDashboard
            onHome={() => setCurrentView('landing')}
            onNavigate={setCurrentView}
          />
        )
      default:
        return <Landing onEnter={(role) => setCurrentView(typeof role === 'string' ? role : 'login')} />
    }
  }

  return (
    <AuthProvider>
      <MockProvider>
        <div className="min-h-screen bg-hg-bg text-white font-inter selection:bg-hg-red/30">
          {renderView()}
        </div>
      </MockProvider>
    </AuthProvider>
  )
}

export default App
