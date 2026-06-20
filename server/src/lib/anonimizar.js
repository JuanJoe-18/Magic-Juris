// Anonimización previa al envío a IA externa (RF-25, Ley 1581).
// Reemplaza los nombres de las partes/terceros por placeholders antes de que el
// texto salga hacia Gemini. Lo ALMACENADO conserva el texto original; solo se
// anonimiza lo que se envía al modelo.
function anonimizar(texto, nombres = []) {
  if (!texto) return texto
  let out = texto
  let i = 1
  for (const nombre of nombres) {
    if (!nombre) continue
    // Cada parte puede traer varios nombres separados por coma/barra.
    const tokens = String(nombre)
      .split(/[,/|]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 4)
    for (const t of tokens) {
      const re = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
      out = out.replace(re, `[PARTE_${i}]`)
    }
    i++
  }
  return out
}

module.exports = { anonimizar }
