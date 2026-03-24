import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'

interface Props {
  max: number
  onConfirm: (n: number) => void
  onClose: () => void
}

export default function BatchLogPopover({ max, onConfirm, onClose }: Props) {
  const { t } = useTranslation()
  const [custom, setCustom] = useState('')
  const [mode, setMode] = useState<'quick' | 'custom'>('quick')
  const inputRef = useRef<HTMLInputElement>(null)

  function confirm(n: number) {
    const capped = Math.min(n, max)
    if (capped > 0) onConfirm(capped)
    onClose()
  }

  function handleCustomConfirm() {
    const n = parseInt(custom)
    if (!isNaN(n) && n > 0) confirm(n)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute bottom-full mb-2 left-0 z-40 bg-[#1e293b] border border-[#334155] rounded-2xl p-3 shadow-2xl shadow-black/50 min-w-[160px]"
    >
      <p className="text-[#64748b] text-xs font-semibold mb-2 text-center">{t('batch.title')}</p>

      {mode === 'quick' ? (
        <div className="flex flex-col gap-1.5">
          {[5, 10].map(n => (
            <button
              key={n}
              onClick={() => confirm(n)}
              disabled={n > max}
              className="py-2 px-4 rounded-xl bg-[#047857] text-white font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#059669] transition-colors"
            >
              +{n > 5 ? '١٠' : '٥'}
            </button>
          ))}
          <button
            onClick={() => { setMode('custom'); setTimeout(() => inputRef.current?.focus(), 50) }}
            className="py-2 px-4 rounded-xl bg-[#334155] text-[#94a3b8] font-medium text-sm hover:bg-[#475569] transition-colors"
          >
            {t('batch.custom')}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <input
            ref={inputRef}
            type="number"
            min={1}
            max={max}
            value={custom}
            onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomConfirm()}
            className="w-full bg-[#0f172a] text-[#f1f5f9] text-center rounded-xl px-3 py-2 border border-[#334155] focus:border-[#047857] outline-none text-sm"
            placeholder={`١–${max}`}
          />
          <button
            onClick={handleCustomConfirm}
            className="py-2 rounded-xl bg-[#047857] text-white font-bold text-sm hover:bg-[#059669] transition-colors"
          >
            {t('batch.confirm')}
          </button>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full mt-1.5 py-1.5 text-[#475569] text-xs hover:text-[#64748b] transition-colors"
      >
        {t('batch.cancel')}
      </button>
    </motion.div>
  )
}
