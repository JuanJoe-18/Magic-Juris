import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login({ onLoginSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await login(email, password);
      // user.role (ADMINISTRATIVO, ABOGADO, CLIENTE)
      onLoginSuccess(user.role.toLowerCase(), user);
    } catch (err) {
      setError('Credenciales inválidas o servidor no disponible. Intente demo123 con admin/abogado/cliente@hg.com');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-hg-bg">
      <div className="w-full max-w-md card">
        <h2 className="mb-6 text-2xl font-bold text-center text-white">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 text-sm text-gray-400">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full input-field" 
              placeholder="ejemplo@hg.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm text-gray-400">Contraseña</label>
            <input 
              type="password" 
              className="w-full input-field" 
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" className="w-full mt-2 btn-accent">
            Ingresar
          </button>
        </form>
        <div className="mt-4 text-center">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-white">
            Volver al inicio (Modo Demo)
          </button>
        </div>
      </div>
      <div className="mt-8 text-sm text-gray-500 card-inner">
        <p className="mb-2 font-bold text-white">Credenciales de prueba:</p>
        <ul className="pl-4 list-disc">
          <li>administrativo@hg.com / demo123</li>
          <li>abogado@hg.com / demo123</li>
          <li>cliente@hg.com / demo123</li>
        </ul>
      </div>
    </div>
  );
}
