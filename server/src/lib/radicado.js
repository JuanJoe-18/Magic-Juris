// Validación de número de radicado (RF-09). 23 dígitos exactos.
function normalizarRadicado(r) {
  return (r || '').replace(/\D/g, '')
}

function esRadicadoValido(r) {
  return typeof r === 'string' && /^\d{23}$/.test(r)
}

module.exports = { normalizarRadicado, esRadicadoValido }
