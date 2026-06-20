import React from 'react'
import { X } from 'lucide-react'

export default function LegalModal({
  open,
  title,
  content,
  mode = 'confirm',
  onClose,
  onAccept,
  onCancel,
  acceptLabel = 'Acepto',
  cancelLabel = 'Cancelar',
}) {
  if (!open) return null

  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleAccept = () => {
    onAccept?.()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6">
      <div className="relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#3A3A3A] bg-[#1C1C1C] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#3A3A3A] px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D9D9D9]/70">
              HURTADO GANDINI
            </p>
            <h2 className="mt-2 font-sora text-2xl font-bold text-white">{title}</h2>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-[#3A3A3A] p-2 text-[#D9D9D9] transition-colors hover:border-[#D9D9D9] hover:text-white"
            aria-label="Cerrar modal legal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">
          <div className="space-y-4 text-sm leading-7 text-[#D9D9D9]">
            {Array.isArray(content)
              ? content.map((paragraph, index) => <p key={index}>{paragraph}</p>)
              : <p>{content}</p>}
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#3A3A3A] px-6 py-4">
          {mode === 'confirm' && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-[#3A3A3A] px-5 py-2.5 text-sm font-semibold text-[#D9D9D9] transition-colors hover:border-[#D9D9D9] hover:text-white"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={mode === 'confirm' ? handleAccept : onClose}
            className="rounded-lg bg-[#84120C] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#A30F0A]"
          >
            {mode === 'confirm' ? acceptLabel : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}
