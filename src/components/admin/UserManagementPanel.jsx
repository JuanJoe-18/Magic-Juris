import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ShieldCheck, UserPlus, Users } from 'lucide-react'

import { userService } from '../../services/userService'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'CLIENTE',
  tarjeta_profesional: '',
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-[#262626] bg-[#161616] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13px] text-white/55">{label}</p>
        <Icon size={18} className="text-white/60" />
      </div>
      <p className="mt-2 font-sora text-3xl font-bold text-white">{value}</p>
    </div>
  )
}

export default function UserManagementPanel() {
  const [users, setUsers] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (err) {
      setError(err.message || 'No fue posible cargar usuarios.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const stats = useMemo(() => {
    const pending = users.filter((user) => !user.is_active).length
    const lawyers = users.filter((user) => user.role === 'ABOGADO').length
    const clients = users.filter((user) => user.role === 'CLIENTE').length
    return {
      total: users.length,
      pending,
      lawyers,
      clients,
    }
  }, [users])

  const filteredUsers = useMemo(() => {
    switch (filter) {
      case 'pending':
        return users.filter((user) => !user.is_active)
      case 'lawyers':
        return users.filter((user) => user.role === 'ABOGADO')
      case 'clients':
        return users.filter((user) => user.role === 'CLIENTE')
      default:
        return users
    }
  }, [filter, users])

  const updateForm = (field, value) => {
    setMessage('')
    setError('')
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'role' && value !== 'ABOGADO' ? { tarjeta_profesional: '' } : {}),
    }))
  }

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await userService.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        tarjeta_profesional: form.role === 'ABOGADO' ? form.tarjeta_profesional : null,
      })
      setForm(initialForm)
      setMessage('Usuario creado correctamente.')
      await loadUsers()
    } catch (err) {
      setError(err.message || 'No fue posible crear el usuario.')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (userId, isActive) => {
    setMessage('')
    setError('')
    try {
      await userService.approveUser(userId, isActive)
      setMessage(isActive ? 'Cuenta aprobada correctamente.' : 'Cuenta desactivada correctamente.')
      await loadUsers()
    } catch (err) {
      setError(err.message || 'No fue posible actualizar la cuenta.')
    }
  }

  const handleRoleChange = async (userId, role) => {
    setMessage('')
    setError('')
    try {
      await userService.updateUserRole(userId, role)
      setMessage('Rol actualizado correctamente.')
      await loadUsers()
    } catch (err) {
      setError(err.message || 'No fue posible actualizar el rol.')
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-sora text-3xl font-bold text-white">Usuarios y accesos</h1>
        <p className="mt-1 text-sm text-white/45">
          Crea usuarios reales, revisa solicitudes pendientes y aprueba cuentas para
          habilitar el acceso al sistema.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Usuarios totales" value={stats.total} icon={Users} />
        <Stat label="Pendientes" value={stats.pending} icon={ShieldCheck} />
        <Stat label="Abogados" value={stats.lawyers} icon={CheckCircle2} />
        <Stat label="Clientes" value={stats.clients} icon={UserPlus} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleCreate}
          className="rounded-[22px] border border-[#262626] bg-[#141414] p-5"
        >
          <h2 className="font-sora text-xl font-bold text-white">Crear usuario real</h2>
          <div className="mt-4 grid gap-4">
            <input
              value={form.name}
              onChange={(e) => updateForm('name', e.target.value)}
              placeholder="Nombre completo"
              className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              required
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
              placeholder="correo@hg.com"
              className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="password"
                value={form.password}
                onChange={(e) => updateForm('password', e.target.value)}
                placeholder="Contrasena temporal"
                className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
                required
              />
              <select
                value={form.role}
                onChange={(e) => updateForm('role', e.target.value)}
                className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white focus:border-[#84120C] focus:outline-none"
              >
                <option value="CLIENTE">CLIENTE</option>
                <option value="ABOGADO">ABOGADO</option>
                <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
              </select>
            </div>
            {form.role === 'ABOGADO' && (
              <input
                value={form.tarjeta_profesional}
                onChange={(e) => updateForm('tarjeta_profesional', e.target.value)}
                placeholder="Tarjeta profesional"
                className="rounded-2xl border border-[#2C2C2C] bg-[#1A1A1A] px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-[#84120C] focus:outline-none"
                required
              />
            )}
          </div>

          {message && <p className="mt-4 text-sm font-semibold text-[#D9D9D9]">{message}</p>}
          {error && <p className="mt-4 text-sm font-semibold text-[#E7A9A3]">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="mt-5 rounded-2xl bg-[#84120C] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A] disabled:opacity-60"
          >
            {saving ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>

        <div className="rounded-[22px] border border-[#262626] bg-[#141414] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-sora text-xl font-bold text-white">Gestion de cuentas</h2>
              <p className="mt-1 text-[13px] text-white/45">
                Aprueba solicitudes pendientes y ajusta roles operativos.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ['all', 'Todos'],
                ['pending', 'Pendientes'],
                ['lawyers', 'Abogados'],
                ['clients', 'Clientes'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                    filter === id
                      ? 'bg-[#84120C] text-white'
                      : 'border border-[#2A2A2A] bg-[#161616] text-white/75 hover:border-[#3A3A3A]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {loading ? (
              <p className="text-sm text-white/45">Cargando usuarios...</p>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-[#262626] bg-[#161616] px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-[12px] text-white/45">{user.email}</p>
                      <p className="mt-2 text-[12px] text-white/55">
                        Estado: {user.is_active ? 'ACTIVO' : 'PENDIENTE'} · Creado:{' '}
                        {new Date(user.created_at).toLocaleDateString('es-CO')}
                      </p>
                      {user.lawyer_profile?.tarjeta_profesional && (
                        <p className="mt-1 text-[12px] text-white/55">
                          TP: {user.lawyer_profile.tarjeta_profesional}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] px-3 py-2 text-xs font-semibold text-white focus:border-[#84120C] focus:outline-none"
                      >
                        <option value="CLIENTE">CLIENTE</option>
                        <option value="ABOGADO">ABOGADO</option>
                        <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
                      </select>
                      {!user.is_active ? (
                        <button
                          onClick={() => handleApprove(user.id, true)}
                          className="rounded-xl bg-[#84120C] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#A30F0A]"
                        >
                          Aprobar
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApprove(user.id, false)}
                          className="rounded-xl border border-[#3A3A3A] px-3 py-2 text-xs font-semibold text-white/80 transition-colors hover:border-[#D9D9D9]"
                        >
                          Desactivar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/45">No hay usuarios para este filtro.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
