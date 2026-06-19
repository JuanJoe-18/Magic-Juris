import { useState } from 'react'
import {
  ChevronDown,
  ArrowDownWideNarrow,
  UserRound,
  Shield,
  FileText,
  Search,
  Sparkles,
  Send,
  Globe,
} from 'lucide-react'
import { formatRadicado, criticidadPeso, jurisdiccionConfig } from '../../lib/ui'
import { clase, nombreDocumento } from './abogadoUi'
import { api } from '../../lib/api'

// ── Tarjeta de una actuación (información cruda de la Rama Judicial) ──
function ActuacionCard({ act }) {
  const [abierto, setAbierto] = useState(false)
  const c = clase(act.criticidad)
  const esDemandado = ['Radicacion', 'Traslado', 'Prueba'].includes(act.tipo)
  const ParteIcon = esDemandado ? Shield : UserRound
  const doc = act.documento || nombreDocumento(act)

  return (
    <div className="rounded-2xl border border-[#2A2A2A] bg-[#161616] p-4 transition-colors hover:border-[#383838]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-sora text-sm font-bold tracking-wide text-white">
            <span className="text-white/60">{act.fecha}</span>
            <span className="mx-2 text-white/30">·</span>
            {act.titulo.toUpperCase()}
          </p>
          <p className="mt-1.5 text-[13px] text-white/55">
            Anotación:{' '}
            <span className="text-white/75">
              {abierto ? act.descripcion : `${(act.descripcion || '').slice(0, 70)}…`}
            </span>
          </p>
          <p className="mt-1 text-[12px] text-white/40">
            Documento: <span className="text-white/60">{doc}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3">
          <span title={c.nivel}>
            <ParteIcon size={18} style={{ color: c.color }} />
          </span>
          <button
            onClick={() => setAbierto((v) => !v)}
            className="text-white/40 transition-colors hover:text-white"
            aria-label="Expandir actuación"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${abierto ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {abierto && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#262626] pt-3 text-[11px]">
          <span
            className="rounded-full px-2.5 py-1 font-semibold text-white"
            style={{ backgroundColor: c.color }}
          >
            {c.nivel}
          </span>
          <span className="rounded-full bg-[#202020] px-2.5 py-1 text-white/60">
            Estado {act.estado}
          </span>
          {doc !== 'Sin documento asociado' && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#202020] px-2.5 py-1 text-white/60">
              <FileText size={12} /> {doc}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

// ── Cabecera de la ficha del proceso ──
function Parte({ label, valor, Icon }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={15} className="mt-0.5 shrink-0 text-white/40" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="text-sm text-white/85">{valor || '—'}</p>
      </div>
    </div>
  )
}

function CabeceraProceso({ proceso, actuaciones }) {
  const jur =
    jurisdiccionConfig[proceso.jurisdiccion] || {
      label: proceso.jurisdiccion || '—',
      icon: null,
      color: '#9CA3AF',
    }
  const JurIcon = jur.icon

  const peso = actuaciones.reduce(
    (m, a) => Math.max(m, criticidadPeso[a.criticidad] ?? 0),
    0
  )
  const critLabel =
    peso >= 3 ? 'Critica' : peso === 2 ? 'Importante' : peso >= 1 ? 'Informativa' : null
  const c = critLabel ? clase(critLabel) : null

  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <p className="font-mono text-xl font-bold tracking-tight text-white">
        {formatRadicado(proceso.radicado)}
      </p>
      <p className="mt-1 text-[13px] text-white/50">
        {proceso.despacho || 'Despacho no especificado'}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] px-2.5 py-1 text-[12px] font-semibold text-white/80">
          {JurIcon && <JurIcon size={13} style={{ color: jur.color }} />}
          {jur.label}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A2A] bg-[#161616] px-2.5 py-1 text-[12px] font-semibold text-white/80">
          <span className="font-sora text-[#A30F0A]">{proceso.estado}</span>
          {proceso.estadoLabel || 'Etapa'}
        </span>
        {c && (
          <span
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12px] font-bold text-white"
            style={{ backgroundColor: c.color }}
          >
            Criticidad: {c.nivel}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 border-t border-[#222] pt-4 sm:grid-cols-2">
        <Parte label="Demandante" valor={proceso.demandantes} Icon={UserRound} />
        <Parte label="Demandado" valor={proceso.demandados} Icon={Shield} />
      </div>
    </div>
  )
}

// ── Panel del resumen IA (técnico, para el abogado) ──
function PanelIA({ resumen }) {
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={16} className="text-[#C79B2B]" />
        <h3 className="font-sora text-lg font-bold text-white">Resumen IA · Abogado</h3>
      </div>
      {resumen ? (
        <p className="text-[13px] leading-relaxed text-white/70">{resumen}</p>
      ) : (
        <p className="text-[13px] text-white/40">
          El resumen técnico se generará automáticamente con el módulo de IA
          (módulo E).
        </p>
      )}
      <button className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-4 py-2 text-[13px] font-semibold text-white/80 transition-colors hover:bg-[#1C1C1C]">
        <Send size={14} /> Enviar resumen al cliente
      </button>
    </div>
  )
}

// ── Panel de fuentes (estilo multi-fuente) ──
function FuentesPanel() {
  const fuentes = [
    { nombre: 'Rama Judicial', estado: 'Activa', color: '#3FA66B' },
    { nombre: 'Consulta Unificada', estado: 'Próximamente', color: '#6B7280' },
    { nombre: 'Publicaciones Procesales', estado: 'Próximamente', color: '#6B7280' },
  ]
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <h3 className="mb-3 font-sora text-lg font-bold text-white">Fuentes</h3>
      <div className="space-y-2">
        {fuentes.map((f) => (
          <div
            key={f.nombre}
            className="flex items-center justify-between rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2"
          >
            <span className="flex items-center gap-2 text-[13px] text-white/80">
              <Globe size={14} className="text-white/40" /> {f.nombre}
            </span>
            <span
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold"
              style={{ color: f.color }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: f.color }} />
              {f.estado}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Panel lateral: Guía Visual de Clasificación ──
function GuiaClasificacion() {
  const filas = [
    { nivel: 'Alta', color: '#C5202E', rango: 'De 1 a 7 dias' },
    { nivel: 'Media', color: '#C79B2B', rango: 'De 7 a 20 dias' },
    { nivel: 'Baja', color: '#3FA66B', rango: 'De 20 a 30 dias' },
  ]
  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <h3 className="mb-4 font-sora text-lg font-bold text-white">
        Guía de clasificación
      </h3>
      <div className="space-y-3">
        {filas.map((f) => (
          <div key={f.nivel} className="flex items-center gap-3">
            <span
              className="w-16 rounded-full py-1 text-center text-[12px] font-bold text-white"
              style={{ backgroundColor: f.color }}
            >
              {f.nivel}
            </span>
            <span className="flex-1 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-center text-[13px] font-semibold text-white/85">
              {f.rango}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Vista Consulta: ficha del proceso con lo consultado en la Rama Judicial ──
export default function ConsultaView() {
  const [radicado, setRadicado] = useState('')
  const [resultado, setResultado] = useState(null) // { proceso, actuaciones, resumenes }
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [orden, setOrden] = useState('cronologico')
  const [menuOrden, setMenuOrden] = useState(false)

  const limpio = radicado.replace(/\D/g, '')

  const consultar = () => {
    if (limpio.length !== 23) {
      setResultado(null)
      setAviso('El número de radicado debe tener 23 dígitos.')
      return
    }
    setCargando(true)
    setAviso(null)
    api
      .consultar(limpio)
      .then((d) => {
        setResultado({
          proceso: d.proceso,
          actuaciones: d.actuaciones,
          resumenes: d.resumenes,
        })
        if (d.desdeCache) {
          const f = d.proceso?.sincronizadoEn
            ? ` (última sincronización: ${new Date(
                d.proceso.sincronizadoEn
              ).toLocaleString('es-CO')})`
            : ''
          setAviso(
            `La Rama Judicial no respondió — mostrando el último estado guardado${f}.`
          )
        } else {
          setAviso(
            d.nuevas > 0
              ? `Rama Judicial: ${d.nuevas} nueva(s) actuación(es) detectada(s).`
              : 'Rama Judicial: consulta realizada, sin novedades.'
          )
        }
      })
      .catch((e) => {
        setResultado(null)
        const msg = String(e.message || '')
        setAviso(
          msg.includes('registrado') || msg.includes('404')
            ? 'Ese radicado no está registrado para seguimiento.'
            : 'No se pudo consultar. ¿El backend está encendido?'
        )
      })
      .finally(() => setCargando(false))
  }

  const actuaciones = (() => {
    const lista = [...(resultado?.actuaciones ?? [])]
    if (orden === 'urgencia') {
      lista.sort(
        (a, b) =>
          (criticidadPeso[b.criticidad] ?? 0) - (criticidadPeso[a.criticidad] ?? 0)
      )
    } else {
      lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }
    return lista
  })()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">
          Consulta profesional por radicado
        </h1>
        <p className="mt-1 text-sm text-white/45">
          Vista para abogado: información cruda, clasificación de relevancia y
          reglas de notificación.
        </p>
      </div>

      {/* Búsqueda por radicado (consulta a demanda) */}
      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
        <p className="mb-2 text-[12px] font-medium text-white/55">Radicado</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3">
            <Search size={16} className="shrink-0 text-white/35" />
            <input
              value={radicado}
              onChange={(e) => setRadicado(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && consultar()}
              placeholder="Ingrese el número de radicado (23 dígitos)…"
              className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
            />
          </div>
          <button
            onClick={consultar}
            disabled={cargando}
            className="shrink-0 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
          >
            {cargando ? 'Consultando…' : 'Consultar Rama Judicial'}
          </button>
        </div>
      </div>

      {aviso && <p className="text-[12px] text-white/60">{aviso}</p>}

      {!resultado ? (
        <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[#2A2A2A] bg-[#0E0E0E] py-20 text-center">
          <Search size={26} className="mb-3 text-white/25" />
          <p className="text-sm text-white/45">
            Ingrese un radicado y consulte la Rama Judicial para ver la ficha del
            proceso.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <CabeceraProceso proceso={resultado.proceso} actuaciones={actuaciones} />

          <div className="grid gap-5 lg:grid-cols-[1fr_minmax(300px,360px)]">
            {/* Actuaciones */}
            <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-sora text-lg font-bold text-white">
                    Ultimas Actualizaciones del proceso
                  </h3>
                  <p className="mt-1 text-[12px] text-white/40">
                    Fuente: consulta Rama Judicial
                  </p>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setMenuOrden((v) => !v)}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#2A2A2A] bg-[#161616] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1C1C1C]"
                  >
                    Filtrar <ArrowDownWideNarrow size={16} />
                  </button>
                  {menuOrden && (
                    <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-[#2A2A2A] bg-[#161616] shadow-xl">
                      {[
                        { id: 'cronologico', label: 'Ordenar cronologicamente' },
                        { id: 'urgencia', label: 'Ordenar por urgencia' },
                      ].map((o) => (
                        <button
                          key={o.id}
                          onClick={() => {
                            setOrden(o.id)
                            setMenuOrden(false)
                          }}
                          className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[#202020] ${
                            orden === o.id ? 'text-white' : 'text-white/60'
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {actuaciones.length > 0 ? (
                  actuaciones.map((act, i) => (
                    <ActuacionCard key={act.id || i} act={act} />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[#2A2A2A] py-12 text-center text-sm text-white/40">
                    Sin actuaciones registradas para este proceso.
                  </div>
                )}
              </div>
            </div>

            {/* Columna derecha: IA + fuentes + guía */}
            <div className="space-y-5">
              <PanelIA resumen={resultado.resumenes?.abogado} />
              <FuentesPanel />
              <GuiaClasificacion />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
