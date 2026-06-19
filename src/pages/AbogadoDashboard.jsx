import { useContext, useState } from 'react'

import { useAuth } from '../context/AuthContext'
import { MockContext } from '../context/MockContext'
import AbogadoHeader from '../components/abogado/AbogadoHeader'
import AbogadoSidebar from '../components/abogado/AbogadoSidebar'
import AsignarView from '../components/abogado/AsignarView'
import ConsultaView from '../components/abogado/ConsultaView'
import HistorialView from '../components/abogado/HistorialView'
import RegistrarProcessView from '../components/abogado/RegistrarProcessView'
import ChatWidget from '../components/shared/ChatWidget'

const headerPorVista = {
  consulta: {
    titulo: 'Consulta cruda y autoclasificacion de actuaciones',
    subtitulo: 'Sistema de seguimiento judicial',
    campana: true,
  },
  historial: {
    titulo: 'Powered by MagicJuris',
    subtitulo: 'Sistema de seguimiento judicial',
  },
  asignar: {
    titulo: 'Powered by MagicJuris',
    subtitulo: 'Sistema de seguimiento judicial',
  },
  registrar: {
    titulo: 'Powered by MagicJuris',
    subtitulo: 'Sistema de seguimiento judicial',
  },
}

export default function AbogadoDashboard({ onHome, onNavigate }) {
  const { procesos } = useContext(MockContext)
  const { user } = useAuth()
  const [vista, setVista] = useState('consulta')
  const [proceso, setProceso] = useState(null)

  const h = headerPorVista[vista]

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-inter text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-5 md:px-8">
        <AbogadoHeader
          titulo={h.titulo}
          subtitulo={h.subtitulo}
          mostrarCampana={h.campana}
          onHome={onHome}
          rolActual="abogado"
          onSwitchRole={onNavigate}
          usuario={{ nombre: user?.name, rol: user?.role }}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
            <AbogadoSidebar vista={vista} setVista={setVista} />
          </div>

          <main className="min-w-0">
            {vista === 'consulta' && (
              <ConsultaView procesos={procesos} proceso={proceso} onSelect={setProceso} />
            )}
            {vista === 'historial' && (
              <HistorialView procesos={procesos} proceso={proceso} onSelect={setProceso} />
            )}
            {vista === 'asignar' && (
              <AsignarView procesos={procesos} proceso={proceso} onSelect={setProceso} />
            )}
            {vista === 'registrar' && <RegistrarProcessView />}
          </main>
        </div>
      </div>

      <ChatWidget rol="abogado" procesoId={proceso?.id} />
    </div>
  )
}
