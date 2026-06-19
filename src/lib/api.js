// Cliente HTTP del frontend hacia el backend (vía proxy de Vite: /api).
async function jget(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

async function jpost(url, body = null) {
  const options = { method: 'POST' }
  if (body) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }
  const r = await fetch(url, options)
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e.error || `HTTP ${r.status}`)
  }
  return r.json()
}

export const api = {
  listarProcesos: () => jget('/api/procesos'),
  obtenerProceso: (radicado) => jget(`/api/procesos/${radicado}`),
  consultar: (radicado) => jpost(`/api/procesos/${radicado}/consultar`),
  chat: (payload) => jpost('/api/chat', payload),
}
