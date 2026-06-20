import { useState } from 'react'
import { Check, Search } from 'lucide-react'

import { formatRadicado } from '../../lib/ui'

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
      procesos.find((p) => p.cliente.toLowerCase().includes(q))

    if (!match && limpio.length === 23) {
      onSelect?.(limpio)
    } else {
      onSelect?.(match || procesos[0])
    }
  }

  return (
    <div className="rounded-[30px] border border-[#2A2A2A] bg-[#121212] p-6">
      <p className="mb-4 text-[1.02rem] font-semibold text-white">Numero de radicado</p>

      <div className="flex flex-col gap-4 xl:flex-row">
        <div className="flex flex-1 items-center gap-3 rounded-2xl border border-[#333333] bg-[#141414] px-5 py-4">
          <Search size={18} className="shrink-0 text-white/35" />
          <input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && consultar()}
            placeholder="Ingrese su numero de radicado"
            className="w-full bg-transparent text-[1rem] text-white placeholder:text-white/35 focus:outline-none"
          />
        </div>

        <button
          onClick={consultar}
          className="inline-flex min-w-[190px] shrink-0 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#7E120D] to-[#B3160E] px-6 py-4 text-[1.02rem] font-semibold text-white transition-all hover:brightness-110"
        >
          Consultar
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 text-[#8A140E]">
            <Check size={18} strokeWidth={3} />
          </span>
        </button>
      </div>

      {procesos.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          {procesos.map((p) => (
            <button
              key={p.id}
              onClick={() => onSelect?.(p)}
              title={formatRadicado(p.radicado)}
              className="rounded-full border border-[#2A2A2A] bg-[#171717] px-3 py-1.5 text-[11px] text-white/60 transition-colors hover:border-[#3A3A3A] hover:text-white"
            >
              {p.cliente}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
