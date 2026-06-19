import { useState } from 'react'
import { Search } from 'lucide-react'
import { formatRadicado } from '../../lib/ui'

// ── Barra de búsqueda por radicado, reutilizable ──
// Permite escribir/seleccionar un radicado y dispara onConsultar(proceso).
// Incluye sugerencias clicables (los procesos del mockData) para la demo.
export default function RadicadoSearch({
  procesos = [],
  onSelect,
  placeholder = 'Ingrese el numero de radicado a buscar...',
  boton = 'Consultar Rama Judicial',
  label = 'Radicado',
}) {
  const [valor, setValor] = useState('')

  const buscar = () => {
    const q = valor.trim().toLowerCase()
    if (!q) {
      onSelect?.(procesos[0])
      return
    }
    const limpio = q.replace(/\D/g, '')
    const match =
      procesos.find((p) => limpio && p.radicado.includes(limpio)) ||
      procesos.find((p) => p.cliente.toLowerCase().includes(q)) ||
      procesos[0]
    onSelect?.(match)
  }

  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <p className="mb-2 text-[12px] font-medium text-white/55">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3">
          <Search size={16} className="shrink-0 text-white/35" />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>
        <button
          onClick={buscar}
          className="shrink-0 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white
                     transition-colors hover:bg-[#A30F0A] focus:outline-none"
        >
          {boton}
        </button>
      </div>

      {/* Sugerencias rápidas (demo) */}
      {procesos.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {procesos.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect?.(p)}
              title={formatRadicado(p.radicado)}
              className="rounded-full border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-[11px]
                         text-white/60 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              {p.cliente}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
