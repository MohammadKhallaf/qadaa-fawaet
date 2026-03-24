import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore, type PrayerPeriod } from '../store/store'
import { motion, AnimatePresence } from 'motion/react'

function calcMissedDays(periods: PrayerPeriod[]): number {
  return periods
    .filter(p => p.type === 'missed')
    .reduce((sum, p) => sum + Math.round(p.years * 365), 0)
}

export default function WizardScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const wizardComplete = useStore(s => s.wizardComplete)
  const completeWizard = useStore(s => s.completeWizard)

  const [step, setStep] = useState(1)
  const [age, setAge] = useState('')
  const [pubertyAge, setPubertyAge] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [quickYears, setQuickYears] = useState('')
  const [periods, setPeriods] = useState<PrayerPeriod[]>([{ type: 'missed', years: 0 }])

  useEffect(() => {
    if (wizardComplete) navigate('/dashboard', { replace: true })
  }, [wizardComplete, navigate])

  const activePeriods: PrayerPeriod[] = advanced
    ? periods
    : quickYears ? [{ type: 'missed', years: parseFloat(quickYears) }] : []

  const totalMissedDays = calcMissedDays(activePeriods)
  const ageNum = parseInt(age)
  const pubertyAgeNum = parseInt(pubertyAge)

  const step1Valid = ageNum >= 10 && ageNum <= 120 && pubertyAgeNum >= 5 && pubertyAgeNum < ageNum
  const step2Valid = totalMissedDays > 0

  function handleConfirm() {
    completeWizard(ageNum, pubertyAgeNum, activePeriods)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {[1,2,3].map(s => (
          <div key={s} className={`w-3 h-3 rounded-full transition-colors ${s === step ? 'bg-[#047857]' : s < step ? 'bg-[#34d399]' : 'bg-[#334155]'}`} />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step1Title')}</h2>
            <div>
              <label className="block text-sm text-[#64748b] mb-1">{t('wizard.ageLabel')}</label>
              <input type="number" min={10} max={120} value={age} onChange={e => setAge(e.target.value)}
                className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
            </div>
            <div>
              <label className="block text-sm text-[#64748b] mb-1">{t('wizard.pubertyAgeLabel')}</label>
              <input type="number" min={5} max={ageNum - 1 || 119} value={pubertyAge} onChange={e => setPubertyAge(e.target.value)}
                className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
            </div>
            <button disabled={!step1Valid} onClick={() => setStep(2)}
              className="w-full py-4 rounded-xl font-bold text-lg bg-[#047857] text-white disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
              {t('wizard.next')}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step2Title')}</h2>
            {!advanced ? (
              <div>
                <label className="block text-sm text-[#64748b] mb-1">{t('wizard.yearsLabel')}</label>
                <input type="number" min={0.5} max={99} step={0.5} value={quickYears} onChange={e => setQuickYears(e.target.value)}
                  className="w-full bg-[#1e293b] text-[#f1f5f9] rounded-lg px-4 py-3 text-lg outline-none border border-[#334155] focus:border-[#047857]" />
              </div>
            ) : (
              <div className="space-y-3">
                {periods.map((p, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select value={p.type} onChange={e => {
                        const np = [...periods]; np[i] = { ...p, type: e.target.value as 'missed'|'regular' }; setPeriods(np)
                      }} className="bg-[#1e293b] text-[#f1f5f9] rounded-lg px-3 py-2 border border-[#334155]">
                      <option value="missed">{t('wizard.periodMissed')}</option>
                      <option value="regular">{t('wizard.periodRegular')}</option>
                    </select>
                    <input type="number" min={0.5} max={99} step={0.5} value={p.years || ''} onChange={e => {
                        const np = [...periods]; np[i] = { ...p, years: parseFloat(e.target.value) || 0 }; setPeriods(np)
                      }} className="flex-1 bg-[#1e293b] text-[#f1f5f9] rounded-lg px-3 py-2 border border-[#334155]" placeholder="سنوات" />
                    {periods.length > 1 && (
                      <button onClick={() => setPeriods(periods.filter((_, j) => j !== i))}
                        className="text-[#f87171] text-sm px-2 min-h-[44px]">{t('wizard.removePeriod')}</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setPeriods([...periods, { type: 'missed', years: 0 }])}
                  className="text-[#047857] text-sm min-h-[44px]">+ {t('wizard.addPeriod')}</button>
              </div>
            )}
            <button onClick={() => setAdvanced(!advanced)} className="text-sm text-[#64748b] underline min-h-[44px]">
              {t('wizard.advancedToggle')}
            </button>
            <div className="bg-[#1e293b] rounded-xl p-4">
              <p className="text-sm text-[#64748b]">{t('wizard.totalMissed')}</p>
              <p className="text-3xl font-bold text-[#047857]">{totalMissedDays.toLocaleString('ar-EG')}</p>
            </div>
            {!step2Valid && (quickYears || advanced) && (
              <p className="text-[#f87171] text-sm">{t('wizard.zeroDaysWarning')}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl border border-[#334155] text-[#f1f5f9] min-h-[44px]">
                {t('wizard.back')}
              </button>
              <button disabled={!step2Valid} onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-xl font-bold bg-[#047857] text-white disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]">
                {t('wizard.next')}
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
            className="w-full max-w-sm space-y-6">
            <h2 className="text-2xl font-bold text-[#f1f5f9]">{t('wizard.step3Title')}</h2>
            <div className="bg-[#1e293b] rounded-xl p-4 space-y-3">
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.ageLabel')}</span><span className="text-[#f1f5f9] font-bold">{age}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.pubertyAgeLabel')}</span><span className="text-[#f1f5f9] font-bold">{pubertyAge}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.totalMissed')}</span><span className="text-[#047857] font-bold text-xl">{totalMissedDays.toLocaleString('ar-EG')}</span></div>
              <div className="flex justify-between"><span className="text-[#64748b]">{t('wizard.totalPrayers')}</span><span className="text-[#f59e0b] font-bold text-xl">{(totalMissedDays * 5).toLocaleString('ar-EG')}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl border border-[#334155] text-[#f1f5f9] min-h-[44px]">
                {t('wizard.back')}
              </button>
              <button onClick={handleConfirm} className="flex-1 py-4 rounded-xl font-bold bg-[#047857] text-white min-h-[44px]">
                {t('wizard.confirm')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
