import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { fireConfetti } from './confetti'

interface Props {
  onClose: () => void
}

export default function DuaModal({ onClose }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    fireConfetti()
  }, [])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      {/* Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      >
        <div className="w-full max-w-lg bg-gradient-to-t from-[#0a2318] to-[#1e293b] rounded-t-3xl px-6 pt-6 pb-10 border-t border-[#065f46]/50 text-center">
          <div className="w-10 h-1 bg-[#334155] rounded-full mx-auto mb-5" />
          <p className="text-4xl mb-3">{t('dua.title').split(' ')[0]}</p>
          <p className="text-[#34d399] font-bold text-lg mb-1">{t('dua.title').replace(/^\S+\s*/, '')}</p>
          <p className="text-[#64748b] text-sm mb-5">{t('dua.subtitle')}</p>
          <p className="text-[#e2e8f0] text-xl leading-loose font-arabic mb-3 tracking-wide">
            {t('dua.text')}
          </p>
          <p className="text-[#475569] text-xs mb-6 leading-relaxed">{t('dua.subtext')}</p>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
          >
            {t('dua.close')}
          </button>
        </div>
      </motion.div>
    </>
  )
}
