import { UserRound } from 'lucide-react'
import { formatRadicado } from '../../lib/ui'
import { tipoCliente } from './abogadoUi'

// ── Pill con el radicado activo y el tipo de cliente ──
export default function CasoPill({ proceso }) {
  if (!proceso) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#262626] bg-[#141414] px-5 py-4">
      <p className="text-base text-white/80">
        Radicado:{' '}
        <span className="font-semibold text-white">
          {formatRadicado(proceso.radicado)}
        </span>
      </p>
      <p className="flex items-center gap-2 text-sm text-white/60">
        Tipo de cliente:{' '}
        <span className="font-bold text-white">{tipoCliente(proceso)}</span>
        <UserRound size={18} className="text-white/70" />
      </p>
    </div>
  )
}
