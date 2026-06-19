import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale } from 'lucide-react';

export default function Login({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await login(email, password);
      // user.role (ADMINISTRATIVO, ABOGADO, CLIENTE)
      onLoginSuccess(user.role.toLowerCase(), user);
    } catch (err) {
      setError('Credenciales inválidas o servidor no disponible. Intente demo123 con admin/abogado/cliente@hg.com');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-hg-bg font-inter">
      <div className="w-full max-w-md bg-hg-surface border border-hg-border rounded-xl p-8 shadow-2xl">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-hg-red w-12 h-12 flex items-center justify-center rounded-lg mb-4">
            <Scale size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-sora font-bold text-white leading-tight">HURTADO GANDINI</h2>
          <p className="text-xs text-hg-gray font-medium mt-1">Powered by MagicJuris</p>
        </div>
        
        <div className="mb-6 text-center">
          <h3 className="font-sora text-xl font-bold text-white">Ingreso al sistema</h3>
          <p className="text-sm text-hg-gray mt-1">Sistema de seguimiento judicial</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-hg-gray">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="ejemplo@hg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-hg-gray">Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-hg-red font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 py-3 text-[15px] flex justify-center items-center gap-2">
            {loading ? <span className="animate-pulse">Iniciando sesión...</span> : "Ingresar"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button onClick={onBack} className="text-[13px] text-hg-gray hover:text-white transition-colors">
            Volver al inicio (Modo Demo)
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-[13px] text-hg-gray border border-hg-border bg-hg-surface px-6 py-4 rounded-xl max-w-md w-full">
        <p className="mb-2 font-semibold text-white">Credenciales de prueba:</p>
        <ul className="pl-4 list-disc space-y-1">
          <li>administrativo@hg.com / demo123</li>
          <li>abogado@hg.com / demo123</li>
          <li>cliente@hg.com / demo123</li>
        </ul>
      </div>
    </div>
  );
}
