import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { useStore } from '../store/store'
import i18n from '../i18n'

export function useDashboardTour() {
  const dashboardTourComplete = useStore(s => s.dashboardTourComplete)
  const completeDashboardTour = useStore(s => s.completeDashboardTour)

  useEffect(() => {
    if (dashboardTourComplete) return

    // Small delay so DOM elements are rendered
    const timer = setTimeout(() => {
      const t = (key: string) => i18n.t(key)
      const isRtl = i18n.language === 'ar'

      const driverObj = driver({
        animate: true,
        smoothScroll: true,
        allowClose: true,
        overlayOpacity: 0.6,
        stagePadding: 6,
        stageRadius: 12,
        popoverClass: 'qadaa-tour-popover',
        nextBtnText: isRtl ? 'التالي ←' : 'Next →',
        prevBtnText: isRtl ? '→ السابق' : '← Back',
        doneBtnText: t('onboarding.tourDone'),
        onDestroyStarted: () => {
          completeDashboardTour()
          driverObj.destroy()
        },
        steps: [
          {
            element: '[data-tour="banner"]',
            popover: {
              title: t('onboarding.tourBanner.title'),
              description: t('onboarding.tourBanner.desc'),
              side: 'bottom',
              align: 'center',
            },
          },
          {
            element: '[data-tour="prayer-row"]',
            popover: {
              title: t('onboarding.tourPrayer.title'),
              description: t('onboarding.tourPrayer.desc'),
              side: 'bottom',
              align: 'center',
            },
          },
          {
            element: '[data-tour="log-full-day"]',
            popover: {
              title: t('onboarding.tourFullDay.title'),
              description: t('onboarding.tourFullDay.desc'),
              side: 'top',
              align: 'center',
            },
          },
          {
            element: '[data-tour="streak"]',
            popover: {
              title: t('onboarding.tourStreak.title'),
              description: t('onboarding.tourStreak.desc'),
              side: 'bottom',
              align: 'start',
            },
          },
        ],
      })

      driverObj.drive()
    }, 600)

    return () => clearTimeout(timer)
  }, [dashboardTourComplete, completeDashboardTour])
}
