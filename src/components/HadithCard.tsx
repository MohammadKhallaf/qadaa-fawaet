import { useTranslation } from 'react-i18next'

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0)
  const diff = date.getTime() - start.getTime()
  return Math.floor(diff / 86400000)
}

export default function HadithCard() {
  const { t } = useTranslation()
  const hadiths = t('hadiths', { returnObjects: true }) as string[]
  const index = getDayOfYear(new Date()) % hadiths.length
  const text = hadiths[index]

  return (
    <div className="mx-4 mb-4 bg-[#1e293b]/60 border border-[#334155]/40 rounded-2xl px-4 py-3.5">
      <p className="text-[#64748b] text-[11px] font-semibold uppercase tracking-widest mb-1.5 text-center">
        ✦
      </p>
      <p className="text-[#94a3b8] text-sm text-center leading-relaxed">
        {text}
      </p>
    </div>
  )
}
