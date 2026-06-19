// Clasificador PROVISIONAL por reglas (RF-18) + mapeo a etapa del modelo de
// estados (RF-20). Es un stub del Módulo D: Juan Jose lo reemplazará/mejorará
// con el modelo de IA. Sirve para que el monitoreo produzca filas válidas.
const REGLAS = [
  {
    criticidad: 'Critica',
    estado: 'E2',
    kw: /audiencia|vencimiento|t[eé]rmino|fallo|sentencia|apelaci|inadmis|subsan/i,
  },
  {
    criticidad: 'Importante',
    estado: 'E3',
    kw: /traslado|prueba|requerimiento|alegatos|mandamiento|cautelar/i,
  },
  {
    criticidad: 'Informativa',
    estado: 'E3',
    kw: /constancia|secretar|ob[eé]dezcase|c[uú]mplase|reparto|despacho/i,
  },
]

function clasificarActuacion(act) {
  const txt = `${act.titulo || ''} ${act.descripcion || ''}`
  for (const r of REGLAS) {
    if (r.kw.test(txt)) return { criticidad: r.criticidad, estado: r.estado }
  }
  return { criticidad: 'Informativa', estado: 'E1' }
}

module.exports = { clasificarActuacion }
