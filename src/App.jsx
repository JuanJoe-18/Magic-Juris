import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import AbogadoDashboard from './pages/AbogadoDashboard'
import ClienteDashboard from './pages/ClienteDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import { MockProvider } from './context/MockContext'
import { AuthProvider, useAuth } from './context/AuthContext'

function MainApp() {
  const { user, loading, logout } = useAuth()
  const [currentView, setCurrentView] = useState('login')

  useEffect(() => {
    if (user) {
      setCurrentView(user.role.toLowerCase())
    } else {
      setCurrentView('login')
    }
  }, [user])

  if (loading) {
    return <div className="min-h-screen bg-hg-bg flex items-center justify-center text-white">Cargando aplicación...</div>
  }

  const handleLogout = () => {
    logout()
    setCurrentView('login')
  }

  const renderView = () => {
    switch(currentView) {
      case 'landing':
        return <Landing onEnter={(role) => setCurrentView(typeof role === 'string' ? role : 'login')} />
      case 'login':
        return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
      case 'abogado':
        if (!user || user.role !== 'ABOGADO') return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
        return (
          <AbogadoDashboard
            onHome={handleLogout}
            onNavigate={setCurrentView}
          />
        )
      case 'cliente':
        if (!user || user.role !== 'CLIENTE') return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
        return (
          <ClienteDashboard
            onHome={handleLogout}
            onNavigate={setCurrentView}
          />
        )
      case 'admin':
      case 'administrativo':
        if (!user || user.role !== 'ADMINISTRATIVO') return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
        return (
          <AdminDashboard
            onHome={handleLogout}
            onNavigate={setCurrentView}
          />
        )
      default:
        return <Login onLoginSuccess={(role) => setCurrentView(role)} onBack={() => setCurrentView('landing')} />
    }
  }

  return (
    <div className="min-h-screen bg-hg-bg text-white font-inter selection:bg-hg-red/30">
      {renderView()}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <MockProvider>
        <MainApp />
      </MockProvider>
    </AuthProvider>
  )
}

export default App
