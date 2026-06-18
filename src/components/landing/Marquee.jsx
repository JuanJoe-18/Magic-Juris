// Cinta infinita con referencias normativas y actuaciones del CGP.
const items = [
  'Auto admisorio',
  'Art. 295 CGP · Notificación por estado',
  'Fijación de audiencia · Art. 372',
  'Ley 1581 · Habeas Data',
  'Traslado para alegatos',
  'Art. 90 CGP · Subsanación',
  'Ley 1564 de 2012',
  'Resolución SIC 58834/2023',
  'Recurso de apelación · Art. 322',
  'Medidas cautelares',
  'CPACA · Ley 1437 de 2011',
  'Sentencia de primera instancia',
]

export default function Marquee() {
  const row = [...items, ...items]
  return (
    <div className="marquee-pause relative overflow-hidden border-y border-white/[0.06] bg-white/[0.015] py-4">
      {/* difuminados laterales */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-hg-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-hg-bg to-transparent" />

      <div className="anim-marquee flex w-max items-center gap-8 whitespace-nowrap">
        {row.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-8 text-sm text-white/35">
            <span className="font-sora">{it}</span>
            <span className="h-1 w-1 rounded-full bg-hg-red/60" />
          </span>
        ))}
      </div>
    </div>
  )
}
