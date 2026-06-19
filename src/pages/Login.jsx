import React, { useMemo, useState } from 'react'
import { Scale } from 'lucide-react'

import AuthFooter from '../components/shared/AuthFooter'
import LegalModal from '../components/shared/LegalModal'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'

const LEGAL_TEXT = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non arcu eget sem porttitor placerat. Integer vulputate, tortor in scelerisque faucibus, mauris sem pulvinar neque, vel commodo justo tellus vitae libero. Donec feugiat nisl nec justo tempus, vitae feugiat lectus porttitor.',
  'Praesent eleifend, purus non bibendum consectetur, mauris lorem iaculis justo, ac aliquam nulla sapien non lacus. Nunc euismod, nibh sed facilisis volutpat, sem lectus volutpat nibh, a tincidunt lorem elit id mi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae.',
  'Aliquam vitae urna gravida, sollicitudin ex eu, pellentesque lacus. Vivamus in dignissim lectus. Mauris ullamcorper, risus et tincidunt ultrices, purus tellus posuere enim, vel pellentesque lorem urna in ipsum. Integer in eros feugiat, laoreet magna vel, fermentum lectus.',
  'Suspendisse potenti. Curabitur id blandit massa. Etiam posuere viverra velit, sit amet feugiat justo interdum sed. Sed blandit augue sit amet erat ultricies, sit amet rhoncus lorem faucibus. Proin tristique gravida augue, vitae eleifend lorem consequat et.',
  'Morbi tincidunt varius nisi, a molestie justo luctus a. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nam et dui malesuada, efficitur lacus a, interdum massa. Pellentesque nec consequat orci. Curabitur congue ligula sit amet augue tincidunt accumsan.',
  'Ut malesuada dictum ullamcorper. Fusce fermentum mi at mi feugiat, at tristique dui finibus. Duis at est in eros feugiat pellentesque. Nullam ut augue id purus tristique dictum. Cras ut semper urna. Nulla facilisi. Integer venenatis lorem vel sem volutpat, a accumsan massa tincidunt.',
]

const initialRegisterForm = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  requestedRole: 'CLIENTE',
  professionalCard: '',
  acceptedPolicy: false,
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-medium text-[#E7A9A3]">{message}</p>
}

function inputClass(hasError) {
  return `w-full rounded-lg border px-4 py-3 text-sm text-white placeholder:text-[#D9D9D9]/35 focus:outline-none transition-colors ${
    hasError
      ? 'border-[#B65A52] bg-[#141414]'
      : 'border-[#3A3A3A] bg-[#141414] focus:border-[#84120C]'
  }`
}

export default function Login({ onLoginSuccess, onBack }) {
  const { login } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [registerForm, setRegisterForm] = useState(initialRegisterForm)
  const [registerTouched, setRegisterTouched] = useState({})
  const [registerMessage, setRegisterMessage] = useState('')
  const [registerError, setRegisterError] = useState('')
  const [registerLoading, setRegisterLoading] = useState(false)
  const [policyAcceptedOnce, setPolicyAcceptedOnce] = useState(false)
  const [legalModal, setLegalModal] = useState({ open: false, type: 'policy-consent' })

  const registerErrors = useMemo(() => {
    const errors = {}
    if (!registerForm.fullName.trim()) errors.fullName = 'Ingresa el nombre completo.'
    if (!registerForm.email.trim()) errors.email = 'Ingresa un correo electronico.'
    if (!registerForm.password) errors.password = 'Ingresa una contrasena.'
    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Confirma la contrasena.'
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Las contrasenas no coinciden.'
    }
    if (registerForm.requestedRole === 'ABOGADO' && !registerForm.professionalCard.trim()) {
      errors.professionalCard = 'Ingresa la tarjeta profesional.'
    }
    if (!registerForm.acceptedPolicy) {
      errors.acceptedPolicy = 'Debes aceptar la politica de tratamiento de datos.'
    }
    return errors
  }, [registerForm])

  const currentLegalTitle =
    legalModal.type === 'terms'
      ? 'Terminos y condiciones'
      : 'Politica de tratamiento y proteccion de datos personales'

  const isRegister = mode === 'register'

  const openLegalModal = (type) => setLegalModal({ open: true, type })

  const switchToMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setRegisterMessage('')
    setRegisterError('')
  }

  const updateRegisterField = (field, value) => {
    setRegisterMessage('')
    setRegisterError('')
    setRegisterForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'requestedRole' && value !== 'ABOGADO' ? { professionalCard: '' } : {}),
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await login(email, password)
      onLoginSuccess(user.role.toLowerCase(), user)
    } catch (err) {
      setError(
        err.message === 'Cuenta pendiente de aprobacion administrativa'
          ? 'Tu cuenta aun no ha sido aprobada por un administrador.'
          : `${err.message || 'Credenciales invalidas o servidor no disponible.'} Intente demo123 con admin/abogado/cliente@hg.com`
      )
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setRegisterTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      professionalCard: true,
      acceptedPolicy: true,
    })

    if (Object.keys(registerErrors).length > 0) {
      setRegisterMessage('')
      return
    }

    setRegisterLoading(true)
    setRegisterError('')
    try {
      const response = await userService.registerRequest({
        name: registerForm.fullName,
        email: registerForm.email,
        password: registerForm.password,
        role: registerForm.requestedRole,
        tarjeta_profesional:
          registerForm.requestedRole === 'ABOGADO' ? registerForm.professionalCard : null,
        accepted_policy: registerForm.acceptedPolicy,
      })
      setRegisterMessage(response.message)
      setRegisterForm(initialRegisterForm)
      setRegisterTouched({})
    } catch (err) {
      setRegisterError(err.message || 'No fue posible registrar la solicitud.')
    } finally {
      setRegisterLoading(false)
    }
  }

  const handlePolicyCheckboxChange = () => {
    if (registerForm.acceptedPolicy) {
      updateRegisterField('acceptedPolicy', false)
      return
    }
    if (!policyAcceptedOnce) {
      openLegalModal('policy-consent')
      return
    }
    updateRegisterField('acceptedPolicy', true)
  }

  return (
    <div className="min-h-screen bg-[#141414] px-4 py-8 font-inter text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col items-center justify-center">
        <div
          className={`w-full rounded-2xl border border-[#3A3A3A] bg-[#1C1C1C] p-8 shadow-2xl ${
            isRegister ? 'max-w-3xl' : 'max-w-md'
          }`}
        >
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#84120C]">
              <Scale size={28} className="text-white" />
            </div>
            <h2 className="font-sora text-2xl font-bold leading-tight text-white">
              HURTADO GANDINI
            </h2>
            <p className="mt-1 text-xs font-medium text-[#D9D9D9]">Powered by MagicJuris</p>
          </div>

          {!isRegister ? (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-sora text-xl font-bold text-white">Ingreso al sistema</h3>
                <p className="mt-1 text-sm text-[#D9D9D9]">Sistema de seguimiento judicial</p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                    Correo electronico
                  </label>
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
                  <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                    Contrasena
                  </label>
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
                {error && <p className="text-sm font-medium text-[#E7A9A3]">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-3 text-[15px]"
                >
                  {loading ? <span className="animate-pulse">Iniciando sesion...</span> : 'Ingresar'}
                </button>
              </form>

              <div className="mt-6 space-y-4 text-center">
                <button
                  type="button"
                  onClick={() => switchToMode('register')}
                  className="text-sm font-semibold text-[#D9D9D9] transition-colors hover:text-white"
                >
                  Crear cuenta
                </button>
                <button
                  onClick={onBack}
                  className="text-[13px] text-[#D9D9D9] transition-colors hover:text-white"
                >
                  Volver al inicio (Modo Demo)
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="font-sora text-xl font-bold text-white">Crear cuenta</h3>
                <p className="mt-1 text-sm text-[#D9D9D9]">
                  Solicitud real de registro sujeta a validacion administrativa
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={registerForm.fullName}
                      onChange={(e) => updateRegisterField('fullName', e.target.value)}
                      onBlur={() => setRegisterTouched((current) => ({ ...current, fullName: true }))}
                      className={inputClass(registerTouched.fullName && registerErrors.fullName)}
                      placeholder="Nombre y apellidos"
                    />
                    <FieldError message={registerTouched.fullName ? registerErrors.fullName : ''} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                      Correo electronico
                    </label>
                    <input
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => updateRegisterField('email', e.target.value)}
                      onBlur={() => setRegisterTouched((current) => ({ ...current, email: true }))}
                      className={inputClass(registerTouched.email && registerErrors.email)}
                      placeholder="nombre@correo.com"
                    />
                    <FieldError message={registerTouched.email ? registerErrors.email : ''} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                      Rol solicitado
                    </label>
                    <select
                      value={registerForm.requestedRole}
                      onChange={(e) => updateRegisterField('requestedRole', e.target.value)}
                      className={inputClass(false)}
                    >
                      <option value="CLIENTE">Cliente</option>
                      <option value="ABOGADO">Abogado</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                      Contrasena
                    </label>
                    <input
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => updateRegisterField('password', e.target.value)}
                      onBlur={() => setRegisterTouched((current) => ({ ...current, password: true }))}
                      className={inputClass(registerTouched.password && registerErrors.password)}
                      placeholder="••••••••"
                    />
                    <FieldError message={registerTouched.password ? registerErrors.password : ''} />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                      Confirmar contrasena
                    </label>
                    <input
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateRegisterField('confirmPassword', e.target.value)}
                      onBlur={() =>
                        setRegisterTouched((current) => ({ ...current, confirmPassword: true }))
                      }
                      className={inputClass(
                        registerTouched.confirmPassword && registerErrors.confirmPassword
                      )}
                      placeholder="••••••••"
                    />
                    <FieldError
                      message={registerTouched.confirmPassword ? registerErrors.confirmPassword : ''}
                    />
                  </div>

                  {registerForm.requestedRole === 'ABOGADO' && (
                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-[#D9D9D9]">
                        Tarjeta profesional
                      </label>
                      <input
                        type="text"
                        value={registerForm.professionalCard}
                        onChange={(e) => updateRegisterField('professionalCard', e.target.value)}
                        onBlur={() =>
                          setRegisterTouched((current) => ({ ...current, professionalCard: true }))
                        }
                        className={inputClass(
                          registerTouched.professionalCard && registerErrors.professionalCard
                        )}
                        placeholder="TP-123456"
                      />
                      <FieldError
                        message={
                          registerTouched.professionalCard ? registerErrors.professionalCard : ''
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-[#3A3A3A] bg-[#141414] p-4">
                  <label className="flex items-start gap-3 text-sm text-[#D9D9D9]">
                    <input
                      type="checkbox"
                      checked={registerForm.acceptedPolicy}
                      onChange={handlePolicyCheckboxChange}
                      className="mt-0.5 h-4 w-4 rounded border-[#3A3A3A] bg-[#141414] accent-[#84120C]"
                    />
                    <span>Acepto la politica de tratamiento y proteccion de datos personales</span>
                  </label>
                  <FieldError
                    message={registerTouched.acceptedPolicy ? registerErrors.acceptedPolicy : ''}
                  />
                </div>

                {registerError && (
                  <div className="rounded-xl border border-[#6B2C27] bg-[#141414] px-4 py-3 text-sm text-[#E7A9A3]">
                    {registerError}
                  </div>
                )}

                {registerMessage && (
                  <div className="rounded-xl border border-[#3A3A3A] bg-[#141414] px-4 py-3 text-sm text-[#D9D9D9]">
                    {registerMessage}
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="btn-primary flex-1 py-3 text-[15px] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {registerLoading ? 'Enviando solicitud...' : 'Crear cuenta'}
                  </button>
                  <button
                    type="button"
                    onClick={() => switchToMode('login')}
                    className="rounded-lg border border-[#3A3A3A] px-4 py-3 text-[15px] font-semibold text-[#D9D9D9] transition-colors hover:border-[#D9D9D9] hover:text-white"
                  >
                    Volver a Login
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <div
          className={`mt-8 w-full rounded-xl border border-[#3A3A3A] bg-[#1C1C1C] px-6 py-4 text-[13px] text-[#D9D9D9] ${
            isRegister ? 'max-w-3xl' : 'max-w-md'
          }`}
        >
          {!isRegister && (
            <>
              <p className="mb-2 font-semibold text-white">Credenciales de prueba:</p>
              <ul className="list-disc space-y-1 pl-4">
                <li>administrativo@hg.com / demo123</li>
                <li>abogado@hg.com / demo123</li>
                <li>cliente@hg.com / demo123</li>
              </ul>
            </>
          )}

          <AuthFooter
            onOpenTerms={() => openLegalModal('terms')}
            onOpenPolicy={() => openLegalModal('policy-info')}
          />
        </div>
      </div>

      <LegalModal
        open={legalModal.open}
        title={currentLegalTitle}
        content={LEGAL_TEXT}
        mode={legalModal.type === 'policy-consent' ? 'confirm' : 'info'}
        onClose={() => setLegalModal({ open: false, type: legalModal.type })}
        onCancel={() => {
          if (legalModal.type === 'policy-consent') {
            updateRegisterField('acceptedPolicy', false)
          }
        }}
        onAccept={() => {
          if (legalModal.type === 'policy-consent') {
            setPolicyAcceptedOnce(true)
            updateRegisterField('acceptedPolicy', true)
          }
        }}
      />
    </div>
  )
}
