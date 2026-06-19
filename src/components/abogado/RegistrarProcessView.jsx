import { useState, useEffect } from 'react';
import { processService } from '../../services/processService';
import { userService } from '../../services/userService';

export default function RegistrarProcessView() {
  const [radicado, setRadicado] = useState('');
  const [jurisdiccion, setJurisdiccion] = useState('civil');
  const [tipoParticipacion, setTipoParticipacion] = useState('DEMANDANTE');
  const [clienteId, setClienteId] = useState('');
  const [abogadoId, setAbogadoId] = useState('');
  const [etapa, setEtapa] = useState('Apertura');
  const [estado, setEstado] = useState('E1');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [clientes, setClientes] = useState([]);
  const [abogados, setAbogados] = useState([]);

  useEffect(() => {
    userService.getUsers().then(users => {
      if(Array.isArray(users)) {
        setClientes(users.filter(u => u.role === 'CLIENTE'));
        setAbogados(users.filter(u => u.role === 'ABOGADO'));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (radicado.length !== 23 || !/^\d+$/.test(radicado)) {
      setError('El radicado debe tener exactamente 23 dígitos numéricos.');
      return;
    }
    
    try {
      await processService.createProcess({
        radicado,
        jurisdiccion,
        tipo_participacion: tipoParticipacion,
        cliente_id: parseInt(clienteId),
        abogado_id: parseInt(abogadoId),
        etapa,
        estado
      });
      setSuccess(true);
      setRadicado('');
    } catch (err) {
      setError('Error al registrar proceso. Puede que el radicado ya exista.');
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-2xl font-bold text-white md:text-3xl">Registrar Proceso Judicial</h1>
        <p className="mt-1 text-sm text-white/45">Ingresa los datos para registrar un nuevo proceso en el sistema.</p>
      </div>

      <div className="rounded-[22px] border border-[#262626] bg-[#101010] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Radicado (23 dígitos)</label>
            <input type="text" maxLength={23} className="input-field w-full" value={radicado} onChange={e => setRadicado(e.target.value)} required />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Jurisdicción</label>
              <select className="input-field w-full" value={jurisdiccion} onChange={e => setJurisdiccion(e.target.value)}>
                <option value="civil">Civil</option>
                <option value="laboral">Laboral</option>
                <option value="administrativo">Administrativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo de Participación</label>
              <select className="input-field w-full" value={tipoParticipacion} onChange={e => setTipoParticipacion(e.target.value)}>
                <option value="DEMANDANTE">Demandante</option>
                <option value="DEMANDADO">Demandado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Cliente</label>
              <select className="input-field w-full" value={clienteId} onChange={e => setClienteId(e.target.value)} required>
                <option value="">Seleccione un cliente...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Abogado</label>
              <select className="input-field w-full" value={abogadoId} onChange={e => setAbogadoId(e.target.value)} required>
                <option value="">Seleccione un abogado...</option>
                {abogados.map(a => <option key={a.id} value={a.id}>{a.name} ({a.email})</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Etapa Inicial</label>
              <input type="text" className="input-field w-full" value={etapa} onChange={e => setEtapa(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Estado</label>
              <input type="text" className="input-field w-full" value={estado} onChange={e => setEstado(e.target.value)} required />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">Proceso registrado correctamente.</p>}

          <button type="submit" className="btn-accent w-full justify-center">Registrar Proceso</button>
        </form>
      </div>
    </div>
  );
}
