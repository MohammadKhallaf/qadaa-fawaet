import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import { useStore, type PrayerPeriod } from '../store/store'
import { motion, AnimatePresence } from 'motion/react'
import Tooltip from '../components/Tooltip'

function calcMissedDays(periods: PrayerPeriod[]): number {
  return periods
    .filter(p => p.type === 'missed')
    .reduce((sum, p) => sum + Math.round(p.years * 365), 0)
}

export default function WizardScreen() {
  const { t, i18n } = useTranslation()
  const numLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const navigate = useNavigate()
  const wizardComplete = useStore(s => s.wizardComplete)
  const completeWizard = useStore(s => s.completeWizard)
  const setDailyTarget = useStore(s => s.setDailyTarget)

  const [step, setStep] = useState(1)
  const [age, setAge] = useState('')
  const [pubertyAge, setPubertyAge] = useState('')
  const [advanced, setAdvanced] = useState(false)
  const [quickYears, setQuickYears] = useState('')
  const [periods, setPeriods] = useState<PrayerPeriod[]>([{ type: 'missed', years: 0 }])
  const [dailyTarget, setLocalDailyTarget] = useState<number>(5)
  const [customTarget, setCustomTarget] = useState('')

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
  const customTargetNum = parseInt(customTarget)
  const step3Valid = dailyTarget > 0 && (dailyTarget !== -1 || (customTargetNum > 0 && customTargetNum <= 50))

  function handleConfirm() {
    const finalTarget = dailyTarget === -1 ? customTargetNum : dailyTarget
    setDailyTarget(finalTarget)
    completeWizard(ageNum, pubertyAgeNum, activePeriods)
    navigate('/dashboard', { replace: true })
  }

  const QUICK_TARGETS = [1, 5, 10]
  const inputCls = "w-full bg-[#0f172a] text-[#f1f5f9] rounded-xl px-4 py-3.5 text-lg outline-none border border-[#334155] focus:border-[#047857] min-h-[52px] transition-colors placeholder:text-[#334155]"
  const labelCls = "flex items-center gap-1.5 text-xs font-semibold text-[#475569] uppercase tracking-widest mb-2"
  const primaryBtn = "w-full py-4 rounded-2xl font-bold text-base text-white min-h-[52px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
  const secondaryBtn = "flex-1 py-4 rounded-2xl border border-[#334155] text-[#94a3b8] font-medium text-base min-h-[52px] hover:border-[#475569] transition-colors"

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Step indicator — 4 steps now */}
        <div className="flex justify-center gap-2 mb-10">
          {[1,2,3,4].map(s => (
            <div
              key={s}
              className={`rounded-full transition-all duration-300 ${
                s === step
                  ? 'w-6 h-2 bg-[#047857]'
                  : s < step
                    ? 'w-2 h-2 bg-[#34d399]'
                    : 'w-2 h-2 bg-[#334155]'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#f1f5f9] mb-1">{t('wizard.step1Title')}</h2>
              </div>
              <div>
                <label className={labelCls}>
                  {t('wizard.ageLabel')} <Tooltip text={t('wizard.ageTip')} />
                </label>
                <input
                  type="number" min={10} max={120} value={age}
                  onChange={e => setAge(e.target.value)}
                  className={inputCls}
                  placeholder="30"
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t('wizard.pubertyAgeLabel')} <Tooltip text={t('wizard.pubertyAgeTip')} />
                </label>
                <input
                  type="number" min={5} max={ageNum - 1 || 119} value={pubertyAge}
                  onChange={e => setPubertyAge(e.target.value)}
                  className={inputCls}
                  placeholder="14"
                />
              </div>
              <button
                disabled={!step1Valid}
                onClick={() => setStep(2)}
                className={primaryBtn}
                style={step1Valid ? { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' } : undefined}
              >
                {t('wizard.next')}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#f1f5f9] mb-1">{t('wizard.step2Title')}</h2>
              </div>

              {!advanced ? (
                <div>
                  <label className={labelCls}>
                    {t('wizard.yearsLabel')} <Tooltip text={t('wizard.yearsTip')} />
                  </label>
                  <input
                    type="number" min={0.5} max={99} step={0.5} value={quickYears}
                    onChange={e => setQuickYears(e.target.value)}
                    className={inputCls}
                    placeholder="5"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {periods.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <div className="flex items-center gap-1">
                        <select
                          value={p.type}
                          onChange={e => {
                            const np = [...periods]
                            np[i] = { ...p, type: e.target.value as 'missed' | 'regular' }
                            setPeriods(np)
                          }}
                          className="bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2.5 border border-[#334155] min-h-[44px] text-sm focus:border-[#047857] outline-none"
                        >
                          <option value="missed">{t('wizard.periodMissed')}</option>
                          <option value="regular">{t('wizard.periodRegular')}</option>
                        </select>
                        <Tooltip text={p.type === 'missed' ? t('wizard.periodMissedTip') : t('wizard.periodRegularTip')} />
                      </div>
                      <input
                        type="number" min={0.5} max={99} step={0.5} value={p.years || ''}
                        onChange={e => {
                          const np = [...periods]
                          np[i] = { ...p, years: parseFloat(e.target.value) || 0 }
                          setPeriods(np)
                        }}
                        className="flex-1 bg-[#0f172a] text-[#f1f5f9] rounded-xl px-3 py-2.5 border border-[#334155] min-h-[44px] text-sm focus:border-[#047857] outline-none"
                        placeholder={t('wizard.yearsPlaceholder')}
                      />
                      {periods.length > 1 && (
                        <button
                          onClick={() => setPeriods(periods.filter((_, j) => j !== i))}
                          className="text-[#f87171] text-sm px-2 min-h-[44px]"
                        >
                          {t('wizard.removePeriod')}
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => setPeriods([...periods, { type: 'missed', years: 0 }])}
                    className="text-[#047857] text-sm min-h-[44px] font-medium"
                  >
                    + {t('wizard.addPeriod')}
                  </button>
                </div>
              )}

              <div
                onClick={() => setAdvanced(!advanced)}
                className="flex items-center gap-1.5 text-[#475569] text-sm hover:text-[#64748b] transition-colors cursor-pointer"
              >
                <Tooltip text={t('wizard.advancedTip')} />
                <span className="underline">{t('wizard.advancedToggle')}</span>
              </div>

              {/* Total missed counter */}
              <div className="bg-[#064e3b]/30 border border-[#065f46]/50 rounded-2xl p-4 flex justify-between items-center">
                <p className="flex items-center gap-1.5 text-[#6ee7b7] text-sm font-medium">
                  {t('wizard.totalMissed')} <Tooltip text={t('wizard.totalMissedTip')} />
                </p>
                <p className="text-2xl font-bold text-[#34d399] tabular-nums">{totalMissedDays.toLocaleString(numLocale)}</p>
              </div>

              {!step2Valid && (quickYears || advanced) && (
                <p className="text-[#f87171] text-sm">{t('wizard.zeroDaysWarning')}</p>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className={secondaryBtn}>
                  {t('wizard.back')}
                </button>
                <button
                  disabled={!step2Valid}
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 rounded-2xl font-bold text-base text-white min-h-[52px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={step2Valid ? { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' } : undefined}
                >
                  {t('wizard.next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Feature 1: Step 3 — Daily pace picker */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#f1f5f9] mb-1">{t('wizard.step3Title')}</h2>
                <p className="text-[#475569] text-sm">{t('wizard.step3Subtitle')}</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {QUICK_TARGETS.map(n => {
                  const labels: Record<number, string> = { 1: t('wizard.pace1'), 5: t('wizard.pace5'), 10: t('wizard.pace10') }
                  const active = dailyTarget === n
                  return (
                    <button
                      key={n}
                      onClick={() => { setLocalDailyTarget(n); setCustomTarget('') }}
                      className={`py-4 rounded-2xl font-bold text-sm min-h-[52px] transition-all ${
                        active
                          ? 'text-white shadow-md'
                          : 'bg-[#1e293b] border border-[#334155] text-[#94a3b8] hover:border-[#475569]'
                      }`}
                      style={active ? { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' } : undefined}
                    >
                      {labels[n]}
                    </button>
                  )
                })}
              </div>

              {/* Custom input */}
              <div>
                <button
                  onClick={() => setLocalDailyTarget(-1)}
                  className={`w-full py-3 rounded-2xl font-medium text-sm min-h-[44px] transition-all mb-2 ${
                    dailyTarget === -1
                      ? 'bg-[#1e3a2f] border border-[#047857] text-[#34d399]'
                      : 'bg-[#1e293b] border border-[#334155] text-[#64748b] hover:border-[#475569]'
                  }`}
                >
                  {t('wizard.paceCustom')}
                </button>
                {dailyTarget === -1 && (
                  <input
                    type="number" min={1} max={50} value={customTarget}
                    onChange={e => setCustomTarget(e.target.value)}
                    className={inputCls}
                    placeholder="7"
                    autoFocus
                  />
                )}
              </div>

              <p className="text-[#334155] text-xs text-center">{t('wizard.paceHint')}</p>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className={secondaryBtn}>
                  {t('wizard.back')}
                </button>
                <button
                  disabled={!step3Valid}
                  onClick={() => setStep(4)}
                  className="flex-1 py-4 rounded-2xl font-bold text-base text-white min-h-[52px] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={step3Valid ? { background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' } : undefined}
                >
                  {t('wizard.next')}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4 — Summary */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-bold text-[#f1f5f9] mb-1">{t('wizard.step4Title')}</h2>
              </div>

              <div className="bg-[#1e293b] border border-[#334155]/50 rounded-2xl overflow-hidden">
                {[
                  { label: t('wizard.ageLabel'),        value: age,                                        color: 'text-[#f1f5f9]' },
                  { label: t('wizard.pubertyAgeLabel'),  value: pubertyAge,                                 color: 'text-[#f1f5f9]' },
                  { label: t('wizard.totalMissed'),      value: totalMissedDays.toLocaleString(numLocale),  color: 'text-[#34d399]' },
                  { label: t('wizard.totalPrayers'),     value: (totalMissedDays * 5).toLocaleString(numLocale), color: 'text-[#f59e0b]' },
                  { label: t('wizard.step3Title'),       value: (dailyTarget === -1 ? customTargetNum : dailyTarget).toLocaleString(numLocale), color: 'text-[#94a3b8]' },
                ].map((row, i, arr) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-4 py-3.5 ${
                      i < arr.length - 1 ? 'border-b border-[#334155]/40' : ''
                    }`}
                  >
                    <span className="text-[#475569] text-sm">{row.label}</span>
                    <span className={`font-bold text-lg tabular-nums ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className={secondaryBtn}>
                  {t('wizard.back')}
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-4 rounded-2xl font-bold text-base text-white min-h-[52px] transition-all active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #047857 0%, #059669 100%)' }}
                >
                  {t('wizard.confirm')}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
