'use client'

import { useEffect, useCallback } from 'react'

interface ShortcutHandlers {
    onAssignSelf?: () => void
    onArchive?: () => void
    onEscape?: () => void
}

/**
 * Hook to handle keyboard shortcuts when a card is hovered or focused.
 * Trello-like shortcuts:
 * - Space: Assign/Unassign self
 * - Delete/Backspace: Archive
 * - Esc: Cancel/Close
 */
export function useKeyboardShortcuts(
    isHovered: boolean,
    handlers: ShortcutHandlers,
    isActive: boolean = true
) {
    const handleKeyDown = useCallback(
        (event: KeyboardEvent) => {
            if (!isActive || !isHovered) return

            // Don't trigger shortcuts if user is typing in an input/textarea
            const target = event.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                if (event.key === 'Escape' && handlers.onEscape) {
                    handlers.onEscape()
                }
                return
            }

            switch (event.key) {
                case ' ':
                    event.preventDefault() // Prevent scrolling
                    if (handlers.onAssignSelf) handlers.onAssignSelf()
                    break
                case 'Delete':
                case 'Backspace':
                    event.preventDefault()
                    if (handlers.onArchive) handlers.onArchive()
                    break
                case 'Escape':
                    if (handlers.onEscape) handlers.onEscape()
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
