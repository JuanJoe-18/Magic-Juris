// ── Gráficos del panel administrativo (CSS/SVG puro, sin librerías) ──

// Barras horizontales: data = [{ label, value, color }]
export function EstadoBars({ data }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 text-sm text-white/70">{d.label}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#262626]">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: d.color,
              }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm tabular-nums text-white/70">
            {d.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// Donut de participación con hueco central.
export function ParticipacionDonut({ total, segmentos }) {
  // segmentos = [{ label, value, color }]
  const suma = segmentos.reduce((a, s) => a + s.value, 0) || 1
  let acc = 0
  const stops = segmentos
    .map((s) => {
      const ini = (acc / suma) * 100
      acc += s.value
      const fin = (acc / suma) * 100
      return `${s.color} ${ini}% ${fin}%`
    })
    .join(', ')

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div
        className="relative h-40 w-40 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-[#101010]">
          <span className="font-sora text-3xl font-bold text-white">{total}</span>
          <span className="text-[12px] text-white/45">activos</span>
        </div>
      </div>
      <div className="space-y-3">
        {segmentos.map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{s.label}</p>
              <p className="text-[12px] text-white/45">
                {s.value} casos · {Math.round((s.value / suma) * 100)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Línea de actividad semanal (SVG).
export function ActividadLine({ valores, etiquetas, color = '#A30F0A' }) {
  const w = 320
  const h = 120
  const pad = 10
  const max = Math.max(...valores, 1)
  const min = Math.min(...valores, 0)
  const span = max - min || 1
  const pts = valores.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (valores.length - 1)
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return [x, y]
  })
  const linea = pts.map((p) => p.join(',')).join(' ')
  const area = `${pad},${h - pad} ${linea} ${w - pad},${h - pad}`

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#actFill)" />
        <polyline
          points={linea}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[11px] text-white/35">
        {etiquetas.map((e) => (
          <span key={e}>{e}</span>
        ))}
      </div>
    </div>
  )
}
