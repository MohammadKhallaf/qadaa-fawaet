import { useEffect } from 'react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useStore } from '../store/store'
import { toLocalISODate } from '../utils/date'

interface Props {
  onClose: () => void
}

export default function IntentionSheet({ onClose }: Props) {
  const { t } = useTranslation()
  const setIntentionSetDate = useStore(s => s.setIntentionSetDate)
  const today = toLocalISODate(new Date())

  function confirm() {
    setIntentionSetDate(today)
    onClose()
  }

  // Auto-dismiss after 4s if no interaction
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntentionSetDate(today)
      onClose()
    }, 4000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={confirm}
      />
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      >
        <div className="w-full max-w-lg bg-[#1e293b] rounded-t-3xl px-6 pt-5 pb-10 border-t border-[#334155]/60 text-center">
          <div className="w-10 h-1 bg-[#334155] rounded-full mx-auto mb-4" />
          <p className="text-[#94a3b8] text-xs font-semibold uppercase tracking-widest mb-3">
            {t('intention.title')}
          </p>
          <p className="text-[#e2e8f0] text-xl leading-loose tracking-wide mb-5">
            {t('intention.text')}
          </p>
          <button
            onClick={confirm}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-base mb-2"
            style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
          >
            {t('intention.confirm')}
          </button>
          <p className="text-[#334155] text-xs">{t('intention.auto')}</p>
        </div>
      </motion.div>
    </>
  )
}
