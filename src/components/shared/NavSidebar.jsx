export default function NavSidebar({
  items = [],
  vista,
  setVista,
  footer,
  variant = 'default',
}) {
  const isClient = variant === 'client'

  return (
    <aside
      className={`flex h-full min-h-[720px] flex-col rounded-[30px] border border-[#2A2A2A] bg-[#111111] p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)] ${
        isClient ? 'justify-start' : ''
      }`}
    >
      <p className="mb-5 px-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/40">
        Navegacion
      </p>

      <nav className="space-y-4">
        {items.map(({ id, label, icon: Icon }) => {
          const active = vista === id
          return (
            <button
              key={id}
              onClick={() => setVista(id)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left text-[1.04rem] font-semibold transition-all duration-150 ${
                active
                  ? 'border-[#8F1B13] bg-gradient-to-r from-[#7A120D] to-[#B4170F] text-white shadow-[0_0_18px_-8px_rgba(163,15,10,0.95)]'
                  : 'border-[#313131] bg-[#151515] text-white/88 hover:border-[#454545] hover:bg-[#191919]'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                  active ? 'bg-black/20' : 'bg-[#1E1E1E]'
                }`}
              >
                <Icon size={20} />
              </span>
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <div className="mt-auto pt-8">
        <div className="h-px bg-white/10" />
        {footer && (
          <div className="pt-4">
            <p className="text-[12px] font-semibold text-white/55">{footer.l1}</p>
            {footer.l2 && <p className="text-[12px] text-white/35">{footer.l2}</p>}
          </div>
        )}
      </div>
    </aside>
  )
}
