import confetti from 'canvas-confetti'

/**
 * Triggers a confetti celebration at the given coordinates or defaults to center.
 * @param x Normalized x position (0 to 1)
 * @param y Normalized y position (0 to 1)
 */
export const triggerConfetti = (x?: number, y?: number) => {
    const scalar = 2
    const heart = confetti.shapeFromPath({ path: 'M0 10 C5 5 10 5 10 10 C10 15 5 20 0 25 C-5 20 -10 15 -10 10 C-10 5 -5 5 0 10' })

    const defaults = {
        spread: 360,
        ticks: 100,
        gravity: 0.5,
        decay: 0.94,
        startVelocity: 30,
        colors: ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'],
        origin: { x: x ?? 0.5, y: y ?? 0.5 }
    }

    confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ['circle']
    })

    confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ['circle']
    })
}

/**
 * Trigger a "side" burst effect (Trello style)
 */
export const triggerSuccessBlast = () => {
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

    const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
            return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } })
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } })
    }, 250)
}
