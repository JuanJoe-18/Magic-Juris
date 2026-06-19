import { useState } from 'react'
import { Search } from 'lucide-react'

import { formatRadicado } from '../../lib/ui'

export default function RadicadoSearch({
  procesos = [],
  onSelect,
  placeholder = 'Ingrese el numero de radicado a buscar...',
  boton = 'Consultar Rama Judicial',
  label = 'Radicado',
}) {
  const [valor, setValor] = useState('')

  const buscar = async () => {
    const q = valor.trim().toLowerCase()
    if (!q) {
      onSelect?.(procesos[0])
      return
    }

    const limpio = q.replace(/\D/g, '')
    if (limpio && limpio.length === 23) {
      try {
        const { processService } = await import('../../services/processService')
        const process = await processService.getProcessByRadicado(limpio)
        if (process && !process._mock) {
          process.cliente = 'Cliente (desde DB)'
          process.lineaTiempo = process.lineaTiempo || []
          onSelect?.(process)
          return
        }
      } catch (error) {
        console.warn('Radicado no encontrado en DB, usando mock...', error)
      }
    }

    const match =
      procesos.find((p) => limpio && p.radicado.includes(limpio)) ||
      procesos.find((p) => p.cliente.toLowerCase().includes(q)) ||
      procesos[0]

    onSelect?.(match)
  }

  return (
    <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-5">
      <p className="mb-3 text-[0.98rem] font-medium text-white/72">{label}</p>
      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4">
          <Search size={18} className="shrink-0 text-white/35" />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && buscar()}
            placeholder={placeholder}
            className="w-full bg-transparent text-[1rem] text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>

        <button
          onClick={buscar}
          className="min-w-[180px] rounded-2xl bg-gradient-to-r from-[#7E120D] to-[#B3160E] px-6 py-4 text-[1rem] font-semibold text-white transition-all hover:brightness-110"
        >
          {boton}
        </button>
      </div>

      {procesos.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-3">
          {procesos.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect?.(p)}
              title={formatRadicado(p.radicado)}
              className="rounded-full border border-[#2A2A2A] bg-[#171717] px-4 py-2 text-sm text-white/68 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              {p.cliente}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
