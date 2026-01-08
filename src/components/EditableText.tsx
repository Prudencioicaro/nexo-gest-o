import { useState, useRef, useEffect } from 'react'
import type { KeyboardEvent } from 'react'

interface EditableTextProps {
    value: string
    onSave: (newValue: string) => void
    onCancel?: () => void
    className?: string
    inputClassName?: string
    placeholder?: string
    maxLength?: number
    disabled?: boolean
    autoEditing?: boolean
}

export function EditableText({
    value,
    onSave,
    onCancel,
    className = '',
    inputClassName = '',
    placeholder = 'Sem título',
    maxLength = 100,
    disabled = false,
    autoEditing = false
}: EditableTextProps) {
    const [isEditing, setIsEditing] = useState(autoEditing)
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        setEditValue(value)
    }, [value])

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isEditing])

    const handleSave = () => {
        const trimmed = editValue.trim()
        if (trimmed && trimmed !== value) {
            onSave(trimmed)
        } else {
            setEditValue(value) // Reset to original if empty
            if (onCancel) onCancel()
        }
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditValue(value)
        setIsEditing(false)
        if (onCancel) onCancel()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    const handleDoubleClick = () => {
        if (!disabled) {
            setIsEditing(true)
        }
    }

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                maxLength={maxLength}
                className={`bg-[#2c2c2c] border border-[#3f3f3f] rounded px-2 py-0.5 outline-none text-white w-full ${inputClassName}`}
            />
        )
    }

    return (
        <span
            onDoubleClick={handleDoubleClick}
            title={disabled ? undefined : 'Clique duas vezes para editar'}
            className={`cursor-text hover:bg-white/5 py-0.5 rounded transition-colors ${className} ${disabled ? 'cursor-default' : ''}`}
        >
            {value || placeholder}
        </span>
    )
}
