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
  const { t } = useTranslation()
  const unlockedIds = new Set(badges.map(b => b.id))

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {ALL_BADGE_IDS.map(id => {
        const badge = badges.find(b => b.id === id)
        const unlocked = unlockedIds.has(id)
        return (
          <div key={id} className={`bg-[#1e293b] rounded-2xl p-4 flex flex-col items-center gap-2 ${unlocked ? '' : 'opacity-40'}`}>
            <span className="text-3xl">{BADGE_ICONS[id]}</span>
            <p className="text-sm font-medium text-[#f1f5f9] text-center">{t(`stats.badges_data.${id}`)}</p>
            {unlocked && badge && (
              <p className="text-[10px] text-[#64748b]">
                {new Date(badge.unlockedAt).toLocaleDateString('ar-EG')}
              </p>
            )}
            {!unlocked && (
              <p className="text-[10px] text-[#64748b]">{t('stats.lockedBadge')}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
