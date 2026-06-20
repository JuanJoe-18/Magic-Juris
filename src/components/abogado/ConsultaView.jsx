import { useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowDownWideNarrow,
  Search,
  Shield,
  UserRound,
  Users,
} from 'lucide-react'

import { api } from '../../lib/api'
import { criticidadPeso } from '../../lib/ui'
import { clase, nombreDocumento } from './abogadoUi'

function SearchPanel({ radicado, setRadicado, consultar, cargando }) {
  return (
    <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
      <p className="mb-4 text-[1rem] font-semibold text-white">Radicado</p>
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4">
          <Search size={18} className="shrink-0 text-white/35" />
          <input
            value={radicado}
            onChange={(e) => setRadicado(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && consultar()}
            placeholder="Ingrese el numero de radicado a buscar..."
            className="w-full bg-transparent text-[1rem] text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>

        <button
          onClick={consultar}
          disabled={cargando}
          className="min-w-[250px] rounded-2xl bg-gradient-to-r from-[#7E120D] to-[#B3160E] px-6 py-4 text-[1.02rem] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-60"
        >
          {cargando ? 'Consultando...' : 'Consultar Rama Judicial'}
        </button>
      </div>
    </div>
  )
}

function ActuacionCard({ act }) {
  const c = clase(act.criticidad)
  const ParteIcon =
    act.parte === 'Demandado' ? Shield : act.parte === 'Ambos' ? Users : UserRound

  return (
    <div className="flex items-start justify-between gap-4 rounded-[24px] border border-[#2A2A2A] bg-[#151515] px-5 py-5">
      <div className="flex min-w-0 gap-4">
        <div className="mt-1 flex flex-col items-center">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
          <span className="mt-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <ParteIcon size={23} style={{ color: c.color }} />
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-sora text-[1.65rem] font-semibold leading-tight text-white">
            <span className="mr-3 text-[1.05rem] font-medium text-white/80">{act.fecha}</span>
            {String(act.titulo || act.tipo || 'Actuacion').toUpperCase()}
          </p>
          <p className="mt-3 text-[1rem] text-white/63">
            Anotacion: {(act.descripcion || '').slice(0, 110)}
            {(act.descripcion || '').length > 110 ? '...' : ''}
          </p>
          <p className="mt-2 text-[0.98rem] text-white/55">
            Documento: {act.documento || nombreDocumento(act)}
          </p>
        </div>
      </div>

      <button
        className="mt-6 shrink-0 text-white/58 transition-colors hover:text-white"
        title="Expandir actuacion"
      >
        <ArrowDown size={28} />
      </button>
    </div>
  )
}

function GuiaClasificacion({ proceso }) {
  const filas = [
    { nivel: 'Rojo', color: '#C5202E', rango: 'Urgente' },
    { nivel: 'Amarillo', color: '#C79B2B', rango: 'Importante' },
    { nivel: 'Verde', color: '#3FA66B', rango: 'Informativo' },
  ]

  return (
    <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
      <h3 className="font-sora text-[2rem] font-bold text-white">Guia visual de clasificacion</h3>

      <div className="mt-6 space-y-4">
        {filas.map((fila) => (
          <div
            key={fila.nivel}
            className="flex items-center gap-4 rounded-[22px] border border-[#2A2A2A] bg-[#151515] p-4"
          >
            <span
              className="inline-flex min-w-[72px] justify-center rounded-xl px-4 py-2 text-[1rem] font-bold text-white"
              style={{ backgroundColor: fila.color }}
            >
              {fila.nivel}
            </span>
            <span className="text-[1.05rem] text-white/80">{fila.rango}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 h-px bg-white/10" />

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-center gap-3 rounded-[20px] border border-[#2A2A2A] bg-[#151515] px-4 py-5 text-[1rem] font-semibold text-white/88">
          <Shield size={22} className="text-white/75" /> {proceso?.demandados ? 'Demandado' : 'Demandado'}
        </div>
        <div className="flex items-center justify-center gap-3 rounded-[20px] border border-[#2A2A2A] bg-[#151515] px-4 py-5 text-[1rem] font-semibold text-white/88">
          <UserRound size={22} className="text-white/75" /> {proceso?.demandantes ? 'Demandante' : 'Demandante'}
        </div>
      </div>
    </div>
  )
}

export default function ConsultaView() {
  const [radicado, setRadicado] = useState('')
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState(null)
  const [orden, setOrden] = useState('cronologico')

  const limpio = radicado.replace(/\D/g, '')

  const consultar = () => {
    if (limpio.length !== 23) {
      setResultado(null)
      setAviso('El numero de radicado debe tener 23 digitos.')
      return
    }

    setCargando(true)
    setAviso(null)

    api
      .consultar(limpio)
      .then((data) => {
        setResultado({
          proceso: data.proceso,
          actuaciones: data.actuaciones || [],
          resumenes: data.resumenes || {},
        })

        if (data.desdeCache) {
          setAviso('La Rama Judicial no respondio. Mostrando el ultimo estado guardado.')
        } else {
          setAviso(
            data.nuevas > 0
              ? `Se detectaron ${data.nuevas} nueva(s) actuacion(es).`
              : 'Consulta realizada sin novedades nuevas.'
          )
        }
      })
      .catch((error) => {
        setResultado(null)
        const msg = String(error?.message || '')
        setAviso(
          msg.includes('registrado') || msg.includes('404')
            ? 'Ese radicado no esta registrado para seguimiento.'
            : 'No se pudo consultar. Verifica que el backend de seguimiento este activo.'
        )
      })
      .finally(() => setCargando(false))
  }

  const actuaciones = useMemo(() => {
    const lista = [...(resultado?.actuaciones || [])]
    if (orden === 'urgencia') {
      lista.sort((a, b) => (criticidadPeso[b.criticidad] ?? 0) - (criticidadPeso[a.criticidad] ?? 0))
    } else {
      lista.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    }
    return lista
  }, [orden, resultado])

  const ultimaFecha = actuaciones[0]?.fecha || resultado?.proceso?.sincronizadoEn || 'Sin fecha'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-[3rem] font-bold leading-none text-white">
          Consulta profesional por radicado
        </h1>
        <p className="mt-4 text-[1.1rem] text-white/60">
          Vista para abogado: informacion cruda, clasificacion de relevancia y reglas de notificacion.
        </p>
      </div>

      <SearchPanel
        radicado={radicado}
        setRadicado={setRadicado}
        consultar={consultar}
        cargando={cargando}
      />

      {aviso && <p className="text-[13px] font-medium text-white/55">{aviso}</p>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="font-sora text-[2rem] font-bold text-white">
                Ultimas Actualizaciones de sus procesos cargados
              </h3>
              <p className="mt-2 text-[1rem] text-white/55">
                Fuente: consulta Rama Judicial · Ultima fecha: {ultimaFecha}
              </p>
            </div>

            <button
              onClick={() =>
                setOrden((current) => (current === 'cronologico' ? 'urgencia' : 'cronologico'))
              }
              className="inline-flex items-center gap-3 rounded-2xl border border-[#6B2020] bg-transparent px-5 py-3 text-[1rem] font-semibold text-white/88"
            >
              <ArrowDownWideNarrow size={20} /> Filtrar
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {actuaciones.length > 0 ? (
              actuaciones.map((act, index) => <ActuacionCard key={`${act.titulo}-${index}`} act={act} />)
            ) : (
              <div className="rounded-[24px] border border-dashed border-[#2A2A2A] bg-[#111111] px-6 py-12 text-center text-white/45">
                Consulta un radicado para ver actuaciones clasificadas.
              </div>
            )}
          </div>
        </div>

        <GuiaClasificacion proceso={resultado?.proceso} />
      </div>
    </div>
  )
}
