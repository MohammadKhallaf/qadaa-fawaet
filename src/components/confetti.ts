import confetti from 'canvas-confetti'

export function fireConfetti(): void {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#047857', '#f59e0b', '#34d399', '#fbbf24'],
  })
}
