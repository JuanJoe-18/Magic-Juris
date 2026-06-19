// fetch con reintentos y backoff exponencial (RNF-12).
// Reintenta ante errores de red o respuestas 5xx, con jitter, hasta agotar.
async function fetchRetry(url, opts = {}, cfg = {}) {
  const {
    reintentos = 4,
    baseMs = 500,
    factor = 2,
    maxMs = 8000,
    timeoutMs = 15000,
  } = cfg

  let intento = 0
  let ultimoError

  while (intento <= reintentos) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), timeoutMs)
      const res = await fetch(url, { ...opts, signal: ctrl.signal })
      clearTimeout(t)
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`)
      return res
    } catch (e) {
      ultimoError = e
      if (intento === reintentos) break
      const espera = Math.min(maxMs, baseMs * factor ** intento) + Math.random() * 250
      await new Promise((r) => setTimeout(r, espera))
      intento++
    }
  }
  throw new Error(`fetchRetry agotado para ${url}: ${ultimoError?.message}`)
}

module.exports = { fetchRetry }
