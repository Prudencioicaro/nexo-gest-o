import { useEffect, useCallback } from 'react'

interface KeyboardShortcut {
    key: string
    ctrl?: boolean
    shift?: boolean
    alt?: boolean
    action: () => void
    description: string
}

interface UseKeyboardShortcutsOptions {
    shortcuts: KeyboardShortcut[]
    enabled?: boolean
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (!enabled) return

        // Don't trigger shortcuts when typing in input fields
        const target = event.target as HTMLElement
        if (
            target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable
        ) {
            // Only allow Escape in input fields
            if (event.key !== 'Escape') return
        }

        for (const shortcut of shortcuts) {
            const ctrlMatch = shortcut.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey
            const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
            const altMatch = shortcut.alt ? event.altKey : !event.altKey
            const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()

            if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
                event.preventDefault()
                shortcut.action()
                return
            }
        }
    }, [shortcuts, enabled])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])
}

// Predefined shortcut sets
export function useEscapeKey(action: () => void, enabled = true) {
    useKeyboardShortcuts({
        shortcuts: [{ key: 'Escape', action, description: 'Fechar/Cancelar' }],
        enabled
    })
}

export function useDeleteKey(action: () => void, enabled = true) {
    useKeyboardShortcuts({
        shortcuts: [{ key: 'Delete', action, description: 'Excluir selecionado' }],
        enabled
    })
}

// Keyboard shortcut indicator component
interface ShortcutBadgeProps {
    keys: string[]
    className?: string
}

export function ShortcutBadge({ keys, className = '' }: ShortcutBadgeProps) {
    return (
        <div className= {`flex items-center gap-0.5 ${className}`
}>
{
    keys.map((key, idx) => (
        <span key= { idx } >
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded text-white/40" >
        { key }
    </kbd>
                    { idx<keys.length - 1 && <span className="text-white/20 mx-0.5"> +</span> }
        </span>
    ))
}
    </div>
    )
}

// Keyboard shortcuts help modal content
export const COMMON_SHORTCUTS = [
    { keys: ['Esc'], description: 'Fechar modal/sidebar' },
    { keys: ['Delete'], description: 'Excluir item selecionado' },
    { keys: ['Ctrl', 'N'], description: 'Nova tarefa' },
    { keys: ['Enter'], description: 'Confirmar/Salvar' },
]
