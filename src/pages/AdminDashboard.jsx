import { useContext, useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FolderSearch,
  BarChart3,
  Mail,
  Activity,
  Users,
} from 'lucide-react'
import { MockContext } from '../context/MockContext'
import TopBar from '../components/shared/TopBar'
import NavSidebar from '../components/shared/NavSidebar'
import AdminPanel, { CasosTabla } from '../components/admin/AdminPanel'
import { EstadoBars, ParticipacionDonut, ActividadLine } from '../components/admin/charts'
import { formatFecha } from '../lib/ui'
import { taskService } from '../services/taskService'
import UserManagementPanel from '../components/admin/UserManagementPanel'
import { useAuth } from '../context/AuthContext'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'casos', label: 'Casos', icon: FolderSearch },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'correos', label: 'Correos', icon: Mail },
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
]

const estados = [
  { label: 'Admitida', value: 42, color: '#84120C' },
  { label: 'Notificación', value: 35, color: '#A02A1E' },
  { label: 'Contestación', value: 27, color: '#C79B2B' },
  { label: 'Pruebas', value: 18, color: '#3E78C2' },
  { label: 'Sentencia', value: 6, color: '#3FA66B' },
]

function Panel({ titulo, subtitulo, children }) {
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
      <h3 className="font-sora text-xl font-bold text-white">{titulo}</h3>
      {subtitulo && <p className="mt-1 mb-4 text-[13px] text-white/45">{subtitulo}</p>}
      {children}
    </div>
  )
}

// ── Vista del Administrador: Dashboard · Casos · Reportes · Correos · Actividad ──
export default function AdminDashboard({ onHome, onNavigate }) {
  const { procesos } = useContext(MockContext)
  const { user } = useAuth()
  const [vista, setVista] = useState('dashboard')
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks()
        setTasks(data)
      } catch (error) {
        console.warn('No fue posible cargar tareas para admin.', error)
      }
    }
    loadTasks()
  }, [])

  return (
    <div className="min-h-screen bg-[#0D0D0D] font-inter text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-5 md:px-8">
        <TopBar
          titulo="Panel administrativo de casos activos"
          onHome={onHome}
          usuario={{ nombre: user?.name, rol: user?.role, email: user?.email }}
          rolActual="admin"
          onSwitchRole={onNavigate}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="lg:sticky lg:top-5 lg:h-[calc(100vh-40px)]">
            <NavSidebar
              items={items}
              vista={vista}
              setVista={setVista}
              footer={{ l1: 'Vista administrativa', l2: 'Control general de procesos' }}
            />
          </div>

          <main className="min-w-0">
            {vista === 'dashboard' && (
              <div className="space-y-5">
                <AdminPanel procesos={procesos} />
                <Panel
                  titulo="Tareas activas"
                  subtitulo="Vista rapida de tareas de clientes registradas en el sistema."
                >
                  <div className="space-y-3">
                    {tasks.length > 0 ? (
                      tasks.slice(0, 6).map((task) => (
                        <div
                          key={task.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-white">{task.title}</p>
                            <p className="text-[12px] text-white/45">
                              Proceso #{task.process_id} · {task.priority} · {task.status}
                            </p>
                          </div>
                          <span className="text-[12px] text-white/40">
                            {task.due_date || 'Sin fecha limite'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-white/45">
                        Aun no hay tareas activas registradas.
                      </p>
                    )}
                  </div>
                </Panel>
              </div>
            )}

            {vista === 'casos' && (
              <CasosTabla
                procesos={procesos}
                titulo="Todos los casos"
                subtitulo="Cartera completa con etapa, responsable y nivel de urgencia."
              />
            )}

            {vista === 'reportes' && (
              <div className="space-y-5">
                <h1 className="font-sora text-3xl font-bold text-white">Reportes</h1>
                <div className="grid gap-5 lg:grid-cols-2">
                  <Panel
                    titulo="Estado de los procesos"
                    subtitulo="Distribución por etapa procesal."
                  >
                    <EstadoBars data={estados} />
                  </Panel>
                  <Panel
                    titulo="Tipo de participación"
                    subtitulo="Demandante vs. demandado."
                  >
                    <ParticipacionDonut
                      total={128}
                      segmentos={[
                        { label: 'Demandante', value: 76, color: '#84120C' },
                        { label: 'Demandado', value: 52, color: '#3A3A3A' },
                      ]}
                    />
                  </Panel>
                </div>
              </div>
            )}

            {vista === 'correos' && (
              <div className="space-y-5">
                <h1 className="font-sora text-3xl font-bold text-white">
                  Correos enviados
                </h1>
                <Panel
                  titulo="Registro de comunicaciones"
                  subtitulo="Cada resumen enviado al cliente queda guardado con fecha (trazabilidad)."
                >
                  <div className="space-y-3">
                    {procesos.map((p) => {
                      const ult = [...(p.lineaTiempo ?? [])].sort(
                        (a, b) => new Date(b.fecha) - new Date(a.fecha)
                      )[0]
                      return (
                        <div
                          key={p.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {p.cliente}
                            </p>
                            <p className="text-[12px] text-white/45">
                              Resumen IA · {ult?.titulo ?? 'Actualización'}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] text-white/40">
                              {ult ? formatFecha(ult.fecha) : ''}
                            </span>
                            <span className="rounded-md bg-[#84120C] px-2 py-0.5 text-[11px] font-semibold text-white">
                              Entregado
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Panel>
              </div>
            )}

            {vista === 'actividad' && (
              <div className="space-y-5">
                <h1 className="font-sora text-3xl font-bold text-white">
                  Actividad semanal
                </h1>
                <Panel
                  titulo="Actuaciones detectadas por semana"
                  subtitulo="Volumen de actuaciones monitoreadas en la Rama Judicial."
                >
                  <ActividadLine
                    valores={[8, 14, 11, 20, 28]}
                    etiquetas={['S1', 'S2', 'S3', 'S4', 'S5']}
                  />
                </Panel>
              </div>
            )}

            {vista === 'usuarios' && <UserManagementPanel />}
          </main>
        </div>
      </div>
    </div>
  )
}
