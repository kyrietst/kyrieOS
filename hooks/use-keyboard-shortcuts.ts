'use client'

import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
    onAssignSelf?: () => void
    onArchive?: () => void
    onEscape?: () => void
    onPin?: () => void
}

/**
 * Hook to handle keyboard shortcuts when a card is hovered or focused.
 */
export function useKeyboardShortcuts(
    isHovered: boolean,
    handlers: ShortcutHandlers,
    isActive: boolean = true
) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isActive || !isHovered) return

            // Don't trigger shortcuts if user is typing
            const target = event.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                if (event.key === 'Escape' && handlers.onEscape) {
                    handlers.onEscape()
                }
                return
            }

            switch (event.key.toLowerCase()) {
                case ' ':
                    event.preventDefault() // Prevent scrolling
                    if (handlers.onAssignSelf) handlers.onAssignSelf()
                    break
                case 'delete':
                case 'backspace':
                    event.preventDefault()
                    if (handlers.onArchive) handlers.onArchive()
                    break
                case 'escape':
                    if (handlers.onEscape) handlers.onEscape()
                    break
                case 'p':
                    if (handlers.onPin) handlers.onPin()
                    break
                default:
                    break
            }
        },
        [isHovered, handlers, isActive]
    )

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}

interface GlobalShortcutHandlers {
    onNewCard?: () => void
    onSearch?: () => void
}

/**
 * Hook for global shortcuts that don't depend on hover state
 */
export function useGlobalShortcuts(handlers: GlobalShortcutHandlers) {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

            switch (event.key.toLowerCase()) {
                case 'n':
                    if (handlers.onNewCard) {
                        event.preventDefault()
                        handlers.onNewCard()
                    }
                    break
                case 'f':
                    if (handlers.onSearch) {
                        event.preventDefault()
                        handlers.onSearch()
                    }
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [handlers])
}
