import { useContext, useState } from 'react'
import { MockContext } from '../context/MockContext'
import AbogadoSidebar from '../components/abogado/AbogadoSidebar'
import AbogadoHeader from '../components/abogado/AbogadoHeader'
import ConsultaView from '../components/abogado/ConsultaView'
import HistorialView from '../components/abogado/HistorialView'
import AsignarView from '../components/abogado/AsignarView'
import RegistrarProcessView from '../components/abogado/RegistrarProcessView'

// Encabezado por vista (texto del header superior).
const headerPorVista = {
  consulta: {
    titulo: 'Consulta cruda y autoclasificación de actuaciones',
    subtitulo: 'Sistema de seguimiento judicial',
    campana: true,
  },
  historial: {
    titulo: 'Historial del caso y comunicación al cliente',
    subtitulo: 'Sistema de seguimiento judicial',
  },
  asignar: {
    titulo: 'Asignar Acción al caso',
    subtitulo: 'Sistema de seguimiento judicial',
  },
  registrar: {
    titulo: 'Registrar nuevo proceso',
    subtitulo: 'Ingresar datos al sistema',
  },
}

// ── Vista del Abogado (diseño Fajardo): Consulta · Historial · Asignar ──
export default function AbogadoDashboard({ onHome, onNavigate }) {
  const { procesos } = useContext(MockContext)
  const [vista, setVista] = useState('consulta')
  const [proceso, setProceso] = useState(procesos[0] ?? null)

  const h = headerPorVista[vista]

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-inter text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-8">
        <AbogadoHeader
          titulo={h.titulo}
          subtitulo={h.subtitulo}
          mostrarCampana={h.campana}
          onHome={onHome}
          rolActual="abogado"
          onSwitchRole={onNavigate}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <div className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
            <AbogadoSidebar vista={vista} setVista={setVista} />
          </div>

          {/* Contenido */}
          <main className="min-w-0">
            {vista === 'consulta' && (
              <ConsultaView
                procesos={procesos}
                proceso={proceso}
                onSelect={setProceso}
              />
            )}
            {vista === 'historial' && (
              <HistorialView
                procesos={procesos}
                proceso={proceso}
                onSelect={setProceso}
              />
            )}
            {vista === 'asignar' && (
              <AsignarView
                procesos={procesos}
                proceso={proceso}
                onSelect={setProceso}
              />
            )}
            {vista === 'registrar' && (
              <RegistrarProcessView />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
