import { useContext, useState } from 'react'
import { Search, History } from 'lucide-react'

import { MockContext } from '../context/MockContext'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/shared/TopBar'
import NavSidebar from '../components/shared/NavSidebar'
import ClienteConsultaView from '../components/cliente/ClienteConsultaView'
import ClienteHistorialView from '../components/cliente/ClienteHistorialView'
import ChatWidget from '../components/shared/ChatWidget'

const items = [
  { id: 'consulta', label: 'Consulta', icon: Search },
  { id: 'historial', label: 'Historial', icon: History },
]

export default function ClienteDashboard({ onHome, onNavigate }) {
  const { procesos } = useContext(MockContext)
  const { user } = useAuth()
  const [vista, setVista] = useState('consulta')
  const [proceso, setProceso] = useState(null)

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-inter text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-8">
        <TopBar
          titulo="Consulta por numero de radicado"
          onHome={onHome}
          usuario={{ nombre: user?.name, rol: user?.role, email: user?.email }}
          rolActual="cliente"
          onSwitchRole={onNavigate}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
            <NavSidebar items={items} vista={vista} setVista={setVista} />
          </div>

          <main className="min-w-0">
            {vista === 'consulta' ? (
              <ClienteConsultaView procesos={procesos} proceso={proceso} onSelect={setProceso} />
            ) : (
              <ClienteHistorialView procesos={procesos} proceso={proceso} onSelect={setProceso} />
            )}
          </main>
        </div>
      </div>
      <ChatWidget rol="cliente" procesoId={proceso?.id} />
    </div>
  )
}
