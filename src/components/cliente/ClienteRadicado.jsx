import { useState } from 'react'
import { Check } from 'lucide-react'
import { formatRadicado } from '../../lib/ui'

// ── Búsqueda por radicado del Cliente (input + Consultar) ──
export default function ClienteRadicado({ procesos = [], onSelect }) {
  const [valor, setValor] = useState('')

  const consultar = async () => {
    const q = valor.trim().toLowerCase()
    const limpio = q.replace(/\D/g, '')
    if (limpio && limpio.length === 23) {
      try {
        const { processService } = await import('../../services/processService')
        const process = await processService.getProcessByRadicado(limpio)
        onSelect?.({
          ...process,
          cliente: 'Mi proceso',
          lineaTiempo: process.lineaTiempo ?? [],
        })
        return
      } catch (error) {
        console.warn('Radicado no encontrado en backend, usando datos demo.', error)
      }
    }

    const match =
      (limpio && procesos.find((p) => p.radicado.includes(limpio))) ||
      procesos.find((p) => p.cliente.toLowerCase().includes(q)) ||
      procesos[0]
    onSelect?.(match)
  }

  return (
    <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-5">
      <p className="mb-2 text-[12px] font-medium text-white/55">Número de radicado</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && consultar()}
          placeholder="Ingrese su numero de radicado"
          className="flex-1 rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
        />
        <button
          onClick={consultar}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
        >
          Consultar
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/90 text-[#84120C]">
            <Check size={13} strokeWidth={3} />
          </span>
        </button>
      </div>

      {procesos.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-white/35">Mis casos:</span>
          {procesos.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect?.(p)}
              title={formatRadicado(p.radicado)}
              className="rounded-full border border-[#2A2A2A] bg-[#161616] px-3 py-1.5 text-[11px] text-white/60 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              {p.cliente}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
