import React from 'react'

export default function AuthFooter({ onOpenTerms, onOpenPolicy }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#D9D9D9]">
      <button
        type="button"
        onClick={onOpenTerms}
        className="transition-colors hover:text-white"
      >
        Términos y condiciones
      </button>
      <button
        type="button"
        onClick={onOpenPolicy}
        className="transition-colors hover:text-white"
      >
        Política de tratamiento de datos
      </button>
    </div>
  )
}
