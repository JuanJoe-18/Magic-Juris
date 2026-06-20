import { useContext, useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  FolderSearch,
  LayoutDashboard,
  Mail,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { MockContext } from '../context/MockContext'
import UserManagementPanel from '../components/admin/UserManagementPanel'
import HabeasPanel from '../components/admin/HabeasPanel'
import AdminPanel, { CasosTabla } from '../components/admin/AdminPanel'
import { ActividadLine, EstadoBars, ParticipacionDonut } from '../components/admin/charts'
import ChatWidget from '../components/shared/ChatWidget'
import NavSidebar from '../components/shared/NavSidebar'
import TopBar from '../components/shared/TopBar'
import { formatFecha } from '../lib/ui'
import { taskService } from '../services/taskService'
import { processService } from '../services/processService'
import { userService } from '../services/userService'

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'casos', label: 'Casos', icon: FolderSearch },
  { id: 'reportes', label: 'Reportes', icon: BarChart3 },
  { id: 'correos', label: 'Correos', icon: Mail },
  { id: 'actividad', label: 'Actividad', icon: Activity },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  { id: 'habeas', label: 'Habeas Data', icon: ShieldCheck },
  { id: 'config', label: 'Configuracion', icon: Settings },
]

const estados = [
  { label: 'Admitida', value: 42, color: '#84120C' },
  { label: 'Notificacion', value: 35, color: '#A02A1E' },
  { label: 'Contestacion', value: 27, color: '#C79B2B' },
  { label: 'Pruebas', value: 18, color: '#3E78C2' },
  { label: 'Sentencia', value: 6, color: '#3FA66B' },
]

function Panel({ titulo, subtitulo, children }) {
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
      <h3 className="font-sora text-xl font-bold text-white">{titulo}</h3>
      {subtitulo && <p className="mb-4 mt-1 text-[13px] text-white/45">{subtitulo}</p>}
      {children}
    </div>
  )
}

export default function AdminDashboard({ onHome, onNavigate }) {
  const { user } = useAuth()
  const [vista, setVista] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const [procesos, setProcesos] = useState([])

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks()
        setTasks(data)
      } catch (error) {
        console.warn('No fue posible cargar tareas para admin.', error)
      }
    }
    
    const loadProcesos = async () => {
      try {
        const [data, users] = await Promise.all([
          processService.getProcesses(),
          userService.getUsers().catch(() => []),
        ])
        const mapU = {}
        ;(users || []).forEach((u) => {
          mapU[u.id] = u.name
        })
        // Campos REALES del backend Python: etapa, tipo_participacion, cliente_id, abogado_id.
        const pMapped = (data || []).map((p) => ({
          id: p.id,
          radicado: p.radicado,
          estadoLabel: p.etapa || 'Registrado',
          tipo_participacion: p.tipo_participacion || '',
          jurisdiccion: p.jurisdiccion,
          cliente: mapU[p.cliente_id] || 'Cliente',
          abogado: mapU[p.abogado_id] || 'Abogado',
          criticidad: 'Informativa',
        }))
        setProcesos(pMapped)
      } catch (error) {
        console.warn('Error loading processes in admin dashboard:', error)
      }
    }
    
    loadTasks()
    loadProcesos()
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
                      <p className="text-sm text-white/45">Aun no hay tareas activas registradas.</p>
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

            {vista === 'reportes' && (() => {
              const norm = (s) => (s || '').toString().toLowerCase()
              const total = procesos.length
              const demandantes = procesos.filter((p) => norm(p.tipo_participacion).includes('demandante')).length
              const demandados = procesos.filter((p) => norm(p.tipo_participacion).includes('demandado')).length

              const conteoEtapa = {}
              procesos.forEach((p) => {
                const e = p.estadoLabel || 'Sin etapa'
                conteoEtapa[e] = (conteoEtapa[e] || 0) + 1
              })
              const estadosDinamicos = Object.entries(conteoEtapa).map(([label, value]) => ({
                label,
                value,
                color: ['#84120C', '#A02A1E', '#C79B2B', '#3E78C2', '#3FA66B', '#6B7280'][Math.floor(Math.random() * 6)]
              }))

              return (
                <div className="space-y-5">
                  <h1 className="font-sora text-3xl font-bold text-white">Reportes</h1>
                  <div className="grid gap-5 lg:grid-cols-2">
                    <Panel titulo="Estado de los procesos" subtitulo="Distribucion por etapa procesal.">
                      <EstadoBars data={estadosDinamicos.length ? estadosDinamicos : estados} />
                    </Panel>
                    <Panel titulo="Tipo de participacion" subtitulo="Demandante vs. demandado.">
                      <ParticipacionDonut
                        total={total}
                        segmentos={[
                          { label: 'Demandante', value: demandantes, color: '#84120C' },
                          { label: 'Demandado', value: demandados, color: '#3A3A3A' },
                        ]}
                      />
                    </Panel>
                  </div>
                </div>
              )
            })()}

            {vista === 'correos' && (
              <div className="space-y-5">
                <h1 className="font-sora text-3xl font-bold text-white">Correos enviados</h1>
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
                            <p className="truncate text-sm font-semibold text-white">{p.cliente}</p>
                            <p className="text-[12px] text-white/45">
                              Resumen IA · {ult?.titulo ?? 'Actualizacion'}
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
                <h1 className="font-sora text-3xl font-bold text-white">Actividad semanal</h1>
                <Panel
                  titulo="Actuaciones detectadas por semana"
                  subtitulo="Volumen de actuaciones monitoreadas en la Rama Judicial."
                >
                  <ActividadLine valores={[8, 14, 11, 20, 28]} etiquetas={['S1', 'S2', 'S3', 'S4', 'S5']} />
                </Panel>
              </div>
            )}

            {vista === 'usuarios' && <UserManagementPanel />}

            {vista === 'habeas' && <HabeasPanel />}

            {vista === 'config' && (
              <div className="space-y-5">
                <h1 className="font-sora text-3xl font-bold text-white">
                  Configuracion de Alertas
                </h1>
                <p className="text-sm text-white/45">
                  Ajusta los dias de antelacion para notificar vencimientos y actuaciones.
                </p>
                <div className="grid max-w-2xl gap-5">
                  <Panel
                    titulo="Ventana de Antelacion (Dias)"
                    subtitulo="Define cuantos dias antes de un vencimiento se debe generar la alerta automatica por nivel de criticidad."
                  >
                    <div className="mt-2 space-y-4">
                      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#84120C]" />
                            <span className="font-semibold text-white">Critica</span>
                          </div>
                          <p className="mt-1 text-[12px] text-white/40">
                            Audiencias, fallos, vencimiento inminente.
                          </p>
                        </div>
                        <input
                          type="number"
                          defaultValue={5}
                          className="w-20 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-center text-sm text-white focus:border-[#84120C] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#C79B2B]" />
                            <span className="font-semibold text-white">Importante</span>
                          </div>
                          <p className="mt-1 text-[12px] text-white/40">
                            Traslados, requerimientos, notificaciones.
                          </p>
                        </div>
                        <input
                          type="number"
                          defaultValue={3}
                          className="w-20 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-center text-sm text-white focus:border-[#84120C] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#3A3A3A]" />
                            <span className="font-semibold text-white">Informativa</span>
                          </div>
                          <p className="mt-1 text-[12px] text-white/40">
                            Constancias, oficios, cambios de estado.
                          </p>
                        </div>
                        <input
                          type="number"
                          defaultValue={1}
                          className="w-20 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-center text-sm text-white focus:border-[#84120C] focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      className="mt-6 w-full rounded-xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
                      onClick={() => alert('Configuracion guardada exitosamente.')}
                    >
                      Guardar Configuracion
                    </button>
                  </Panel>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <ChatWidget rol="admin" />
    </div>
  )
}
