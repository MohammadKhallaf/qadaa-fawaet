import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router'
import { useStore } from '../store/store'

export default function OnboardingScreen() {
  const { t } = useTranslation()
  const completeOnboarding = useStore(s => s.completeOnboarding)
  const wizardComplete = useStore(s => s.wizardComplete)
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  const slides = t('onboarding.slides', { returnObjects: true }) as Array<{
    emoji: string; title: string; body: string
  }>
  const total = slides.length
  const slide = slides[index]

  function finish() {
    completeOnboarding()
    navigate(wizardComplete ? '/dashboard' : '/wizard', { replace: true })
  }

  function next() {
    if (index < total - 1) {
      setDirection(1)
      setIndex(i => i + 1)
    } else {
      finish()
    }
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col select-none">
      {/* Centered shell */}
      <div className="flex-1 flex flex-col max-w-sm mx-auto w-full px-6">

        {/* Top bar */}
        <div className="flex justify-between items-center pt-10 pb-2">
          <div className="flex gap-1.5 items-center">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-400 ${
                  i === index ? 'w-7 bg-[#047857]' : i < index ? 'w-1.5 bg-[#34d399]' : 'w-1.5 bg-[#334155]'
                }`}
              />
            ))}
          </div>
          <button
            onClick={finish}
            className="text-[#475569] text-sm py-2 px-3 rounded-xl hover:text-[#64748b] hover:bg-[#1e293b] transition-all"
          >
            {t('onboarding.skip')}
          </button>
        </div>

        {/* Slide content */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -50 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="flex flex-col items-center text-center gap-7 w-full"
            >
              {/* Emoji in glowing circle */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                className="w-28 h-28 rounded-full flex items-center justify-center text-5xl relative"
                style={{
                  background: 'radial-gradient(circle, rgba(4,120,87,0.15) 0%, rgba(4,120,87,0.04) 70%)',
                  border: '1px solid rgba(4,120,87,0.25)',
                  boxShadow: '0 0 48px rgba(4,120,87,0.18)',
                }}
              >
                {slide.emoji}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className="space-y-3"
              >
                <h1 className="text-2xl font-bold text-[#f1f5f9] leading-snug">{slide.title}</h1>
                <p className="text-[#64748b] text-base leading-relaxed">{slide.body}</p>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <div className="pb-10 pt-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={next}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg min-h-[56px]"
            style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
          >
            {index < total - 1 ? t('onboarding.next') : t('onboarding.begin')}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
