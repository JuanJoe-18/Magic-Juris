import { Scale } from 'lucide-react'

// Landing de producto alineada a HGD
export default function Landing({ onEnter }) {
  return (
    <div className="min-h-screen bg-hg-bg text-white font-inter flex flex-col">
      {/* Header simple */}
      <header className="px-8 py-6 border-b border-hg-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-hg-red w-10 h-10 flex items-center justify-center rounded-lg">
            <Scale size={24} className="text-white" />
          </div>
          <div>
            <h1 className="font-sora font-bold text-xl leading-none">HURTADO GANDINI</h1>
            <p className="text-[11px] text-hg-gray font-medium mt-1">Powered by MagicJuris</p>
          </div>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col justify-center max-w-[900px] mx-auto px-8 w-full">
        <div className="w-16 h-1 bg-hg-red mb-8"></div>
        <h2 className="font-sora text-5xl md:text-6xl font-bold leading-tight mb-6">
          Sistema de seguimiento judicial para Hurtado Gandini
        </h2>
        <p className="text-xl text-hg-gray max-w-[600px] mb-12 leading-relaxed">
          Consulta, clasificación y trazabilidad de procesos judiciales en una plataforma interna, segura y auditable.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => onEnter('login')}
            className="btn-primary text-lg px-8 py-4"
          >
            Ingresar
          </button>
          <button 
            onClick={() => onEnter('abogado')}
            className="btn-outline text-lg px-8 py-4"
          >
            Ver demo
          </button>
        </div>
      </main>

      <footer className="border-t border-hg-border py-6 text-center text-sm text-hg-gray">
        <p>© {new Date().getFullYear()} Hurtado Gandini. Uso exclusivo interno.</p>
      </footer>
    </div>
  )
}
