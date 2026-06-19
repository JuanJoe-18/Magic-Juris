import { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react'
import { api } from '../../lib/api'

// El widget recibe el rol (cliente | abogado | admin) y opcionalmente el procesoId en contexto.
export default function ChatWidget({ rol = 'cliente', procesoId = null }) {
  const [open, setOpen] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [historial, setHistorial] = useState([
    { role: 'model', content: '¡Hola! Soy tu asistente legal IA. ¿En qué puedo ayudarte con este caso hoy?' }
  ])
  const [cargando, setCargando] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [historial, open])

  const enviar = async () => {
    if (!mensaje.trim()) return
    const msg = mensaje.trim()
    setMensaje('')
    
    const nuevoHistorial = [...historial, { role: 'user', content: msg }]
    setHistorial(nuevoHistorial)
    setCargando(true)

    try {
      const res = await api.chat({
        mensaje: msg,
        historial: historial, // mandamos el anterior (excluyendo el actual msg)
        procesoId,
        rol
      })
      setHistorial([...nuevoHistorial, { role: 'model', content: res.respuesta }])
    } catch (e) {
      setHistorial([...nuevoHistorial, { role: 'model', content: '❌ Hubo un error de conexión con la IA. ' + e.message }])
    } finally {
      setCargando(false)
    }
  }

  // Estilos adaptativos según el rol
  const theme = {
    abogado: { bg: 'bg-[#84120C]', text: 'text-white', border: 'border-[#A30F0A]' },
    cliente: { bg: 'bg-[#1C5C8A]', text: 'text-white', border: 'border-[#2673A6]' },
    admin: { bg: 'bg-[#C79B2B]', text: 'text-black', border: 'border-[#DEB03C]' }
  }[rol] || { bg: 'bg-[#3A3A3A]', text: 'text-white', border: 'border-[#4A4A4A]' }

  return (
    <>
      {/* Botón flotante */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-transform hover:scale-110 ${theme.bg} ${theme.text}`}
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Ventana de chat */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-[22px] border border-[#2A2A2A] bg-[#101010] shadow-2xl">
          {/* Header */}
          <div className={`flex items-center justify-between px-4 py-3 ${theme.bg} ${theme.text}`}>
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-sora font-semibold text-sm">
                Asistente {rol.charAt(0).toUpperCase() + rol.slice(1)}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-black/20">
              <X size={18} />
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {historial.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-[#2A2A2A] text-white rounded-tr-sm' 
                      : `bg-[#161616] text-white/90 border border-[#2A2A2A] rounded-tl-sm`
                  }`}
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {cargando && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-[#161616] border border-[#2A2A2A] px-4 py-2 text-sm text-white/50">
                  <Loader2 size={14} className="animate-spin" /> Escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-[#2A2A2A] p-3">
            <div className="flex items-end gap-2 rounded-xl border border-[#2C2C2C] bg-[#1A1A1A] p-1 focus-within:border-white/20 transition-colors">
              <textarea
                value={mensaje}
                onChange={e => setMensaje(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    enviar()
                  }
                }}
                placeholder="Escribe un mensaje..."
                className="max-h-32 min-h-[40px] w-full resize-none bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/35 focus:outline-none no-scrollbar"
                rows={1}
              />
              <button 
                onClick={enviar}
                disabled={cargando || !mensaje.trim()}
                className={`shrink-0 rounded-lg p-2 transition-colors disabled:opacity-50 ${theme.bg} ${theme.text}`}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
