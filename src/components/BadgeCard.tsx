import { useTranslation } from 'react-i18next'
import type { Badge } from '../store/store'

const BADGE_ICONS: Record<string, string> = {
  first_log:    '🌱',
  first_week:   '🔥',
  warrior_30:   '⚔️',
  golden_year:  '🌟',
  quarter_way:  '🎯',
  halfway:      '🏃',
  almost_there: '🏅',
  complete:     '🏆',
}

const ALL_BADGE_IDS = Object.keys(BADGE_ICONS)

interface Props {
  badges: Badge[]
}

export default function BadgeGrid({ badges }: Props) {
  const { t, i18n } = useTranslation()
  const dateLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-US'
  const unlockedIds = new Set(badges.map(b => b.id))

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {ALL_BADGE_IDS.map(id => {
        const badge = badges.find(b => b.id === id)
        const unlocked = unlockedIds.has(id)
        return (
          <div
            key={id}
            className={`rounded-2xl p-4 flex flex-col items-center gap-2 border transition-all ${
              unlocked
                ? 'bg-[#1e293b] border-[#334155]/50'
                : 'bg-[#161f2e] border-[#1e293b]'
            }`}
          >
            <span
              className="text-3xl transition-all"
              style={unlocked ? {} : { filter: 'grayscale(1) opacity(0.3)' }}
            >
              {BADGE_ICONS[id]}
            </span>
            <p className={`text-xs font-semibold text-center ${unlocked ? 'text-[#e2e8f0]' : 'text-[#334155]'}`}>
              {t(`stats.badges_data.${id}`)}
            </p>
            {unlocked && badge ? (
              <p className="text-[10px] text-[#34d399]">
                {new Date(badge.unlockedAt).toLocaleDateString(dateLocale)}
              </p>
            ) : (
              <p className="text-[10px] text-[#1e293b] bg-[#1e293b] rounded px-1">
                {t('stats.lockedBadge')}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
