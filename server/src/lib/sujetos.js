// Parsea el campo sujetosProcesales de la Rama Judicial:
// "Demandante: X | Demandante: Y | Demandado: Z" → { demandantes, demandados }
function parseSujetos(str) {
  if (!str) return { demandantes: null, demandados: null }
  const dte = []
  const ddo = []
  for (const parte of str.split('|')) {
    const m = parte.trim().match(/^(Demandante|Demandado)\s*:\s*(.+)$/i)
    if (!m) continue
    if (/demandante/i.test(m[1])) dte.push(m[2].trim())
    else ddo.push(m[2].trim())
  }
  return {
    demandantes: dte.length ? dte.join(', ') : null,
    demandados: ddo.length ? ddo.join(', ') : null,
  }
}

module.exports = { parseSujetos }
