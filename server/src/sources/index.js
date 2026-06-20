// Selector de fuente judicial según la variable de entorno FUENTE_JUDICIAL.
// La lógica de monitoreo es agnóstica a la fuente (RNF-14): cambiar de adaptador
// no toca la detección por diferencia.
const FUENTE = (process.env.FUENTE_JUDICIAL || 'simulada').toLowerCase()

const fuente = FUENTE === 'real' ? require('./ramaJudicial') : require('./simulada')

module.exports = { fuente, FUENTE }
