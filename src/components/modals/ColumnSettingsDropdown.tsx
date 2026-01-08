import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Trash2, Plus, ChevronDown, Check, Type, Hash, List, Calendar, CheckSquare, Users, Tag, Tags } from 'lucide-react'
import type { BoardColumn, ColumnType } from '../../types'

interface ColumnSettingsDropdownProps {
    column: BoardColumn
    onClose: () => void
    onUpdate: (columnId: string, updates: Partial<BoardColumn>) => void
    onDelete: (columnId: string) => void
}

const COLUMN_TYPES: { type: ColumnType; label: string; icon: any }[] = [
    { type: 'text', label: 'Texto', icon: Type },
    { type: 'number', label: 'Número', icon: Hash },
    { type: 'status', label: 'Status', icon: List },
    { type: 'select', label: 'Selecionar', icon: Tag },
    { type: 'multiselect', label: 'Seleção Múltipla', icon: Tags },
    { type: 'date', label: 'Data', icon: Calendar },
    { type: 'boolean', label: 'Checkbox', icon: CheckSquare },
    { type: 'person', label: 'Pessoas', icon: Users },
]

const NUMBER_FORMATS = [
    { id: 'number', label: 'Número' },
    { id: 'decimal', label: 'Com vírgula (0.00)' },
    { id: 'currency_brl', label: 'Reais (R$)' },
    { id: 'currency_usd', label: 'Dólar ($)' },
]

const OPTION_COLORS = [
    { id: 'Gray', hex: '#9B9B9B', label: 'Cinza' },
    { id: 'Blue', hex: '#2383E2', label: 'Azul' },
    { id: 'Teal', hex: '#0A9DAE', label: 'Turquesa' },
    { id: 'Green', hex: '#0B8A5E', label: 'Verde' },
    { id: 'Yellow', hex: '#DFAB01', label: 'Dourado' },
    { id: 'Orange', hex: '#D76B00', label: 'Laranja' },
    { id: 'Pink', hex: '#E34BA9', label: 'Rosa' },
    { id: 'Purple', hex: '#7C3AED', label: 'Roxo' },
    { id: 'Red', hex: '#DC2626', label: 'Vermelho' },
]

export function ColumnSettingsDropdown({ column, onClose, onUpdate, onDelete }: ColumnSettingsDropdownProps) {
    const [name, setName] = useState(column.name)
    const [type, setType] = useState<ColumnType>(column.type)
    const [numberFormat, setNumberFormat] = useState(column.options?.numberFormat || 'number')
    const [statusOptions, setStatusOptions] = useState<any[]>(column.options?.options || [])
    const [newOptionLabel, setNewOptionLabel] = useState('')
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [coords, setCoords] = useState<{ top: number, left: number, width: number } | null>(null)

    const containerRef = useRef<HTMLDivElement>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)

    const updateCoords = () => {
        const parent = document.querySelector(`[data-column-id="${column.id}"]`)
        if (parent) {
            const rect = parent.getBoundingClientRect()
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: 320
            })
        }
    }

    useEffect(() => {
        updateCoords()
        nameInputRef.current?.focus()
        nameInputRef.current?.select()

        window.addEventListener('scroll', updateCoords, true)
        window.addEventListener('resize', updateCoords)

        return () => {
            window.removeEventListener('scroll', updateCoords, true)
            window.removeEventListener('resize', updateCoords)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const portal = document.getElementById('column-settings-portal')
            if (portal && !portal.contains(e.target as Node)) {
                handleSave()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [name, type, numberFormat, statusOptions])

    const handleSave = () => {
        const updates: Partial<BoardColumn> = { name, type }
        if (type === 'number') {
            updates.options = { ...column.options, numberFormat }
        } else if (type === 'status' || type === 'select' || type === 'multiselect') {
            updates.options = { ...column.options, options: statusOptions }
        }
        onUpdate(column.id, updates)
        onClose()
    }

    const addOption = () => {
        if (!newOptionLabel.trim()) return
        const newOption = {
            id: crypto.randomUUID(),
            label: newOptionLabel.trim(),
            color: OPTION_COLORS[statusOptions.length % OPTION_COLORS.length].id
        }
        setStatusOptions([...statusOptions, newOption])
        setNewOptionLabel('')
    }

    const updateOptionColor = (idx: number) => {
        const currentColorIdx = OPTION_COLORS.findIndex(c => c.id === statusOptions[idx].color)
        const nextColorIdx = (currentColorIdx + 1) % OPTION_COLORS.length
        const updated = [...statusOptions]
        updated[idx] = { ...updated[idx], color: OPTION_COLORS[nextColorIdx].id }
        setStatusOptions(updated)
    }

    const removeOption = (idx: number) => {
        setStatusOptions(statusOptions.filter((_, i) => i !== idx))
    }

    const getColorHex = (colorId: string) => {
        return OPTION_COLORS.find(c => c.id === colorId)?.hex || '#9B9B9B'
    }

    const handleDelete = () => {
        if (showDeleteConfirm) {
            onDelete(column.id)
            onClose()
        } else {
            setShowDeleteConfirm(true)
        }
    }

    const needsOptions = type === 'status' || type === 'select' || type === 'multiselect'

    if (!coords) return null

    return createPortal(
        <div
            id="column-settings-portal"
            ref={containerRef}
            className="fixed z-[999] bg-[#09090b] border border-white/[0.08] rounded-[24px] shadow-luxury overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: `${coords.top + 8}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`
            }}
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between">
                <span className="text-[11px] font-bold text-white/20 uppercase tracking-[2px]">Configurar Propriedade</span>
                <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-luxury">
                    <X size={14} />
                </button>
            </div>

            <div className="p-6 space-y-6 max-h-[450px] overflow-y-auto no-scrollbar">
                {/* Name */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Nome</label>
                    <input
                        ref={nameInputRef}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-luxury"
                        placeholder="Nome da coluna"
                    />
                </div>

                {/* Type Grid */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Tipo de Propriedade</label>
                    <div className="grid grid-cols-1 gap-1">
                        {COLUMN_TYPES.map(t => (
                            <button
                                key={t.type}
                                onClick={() => setType(t.type)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-luxury text-left ${type === t.type ? 'bg-primary/10 text-primary' : 'hover:bg-white/[0.02] text-white/40 group'}`}
                            >
                                <div className={`p-1.5 rounded-lg ${type === t.type ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                    <t.icon size={14} className={type === t.type ? 'text-primary' : 'text-white/20'} />
                                </div>
                                <span className="text-xs font-semibold">{t.label}</span>
                                {type === t.type && <Check size={12} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                {type === 'number' && (
                    <div className="space-y-2 animate-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Formato</label>
                        <div className="relative">
                            <select
                                value={numberFormat}
                                onChange={(e) => setNumberFormat(e.target.value)}
                                className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl pl-4 pr-10 py-2.5 text-white text-xs focus:outline-none border-none outline-none appearance-none cursor-pointer"
                            >
                                {NUMBER_FORMATS.map(f => (
                                    <option key={f.id} value={f.id} className="bg-[#09090b]">{f.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 pointer-events-none" />
                        </div>
                    </div>
                )}

                {needsOptions && (
                    <div className="space-y-4 pt-2 border-t border-white/5 animate-in slide-in-from-top-1">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Opções de Status</label>
                        <div className="space-y-2">
                            {statusOptions.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2 group">
                                    <button
                                        type="button"
                                        onClick={() => updateOptionColor(idx)}
                                        className="w-6 h-6 rounded-lg shrink-0 transition-luxury hover:scale-110 border border-white/10 shadow-lg"
                                        style={{ backgroundColor: getColorHex(opt.color) }}
                                    />
                                    <input
                                        type="text"
                                        value={opt.label}
                                        onChange={(e) => {
                                            const updated = [...statusOptions]
                                            updated[idx] = { ...updated[idx], label: e.target.value }
                                            setStatusOptions(updated)
                                        }}
                                        className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary/40 transition-luxury"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-red-500/40 hover:text-red-400 transition-luxury"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newOptionLabel}
                                    onChange={(e) => setNewOptionLabel(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addOption()}
                                    placeholder="Adicionar nova opção..."
                                    className="flex-1 bg-white/[0.02] border border-dashed border-white/10 rounded-lg px-3 py-2 text-white text-[11px] placeholder:text-white/10 focus:outline-none transition-luxury"
                                />
                                <button
                                    type="button"
                                    onClick={addOption}
                                    disabled={!newOptionLabel.trim()}
                                    className="p-2.5 bg-white text-black hover:bg-neutral-200 disabled:opacity-30 rounded-lg transition-luxury shadow-xl"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/[0.03] flex items-center justify-between gap-3 bg-white/[0.01]">
                <button
                    onClick={handleDelete}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-bold transition-luxury ${showDeleteConfirm
                        ? 'bg-red-500 text-white shadow-glow-red'
                        : 'text-white/20 hover:text-red-400 hover:bg-red-500/10'
                        }`}
                >
                    <Trash2 size={12} />
                    <span>{showDeleteConfirm ? 'CONFIRMAR EXCLUSÃO' : 'EXCLUIR PROP.'}</span>
                </button>
                <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-[10px] font-bold transition-luxury shadow-xl"
                >
                    SALVAR
                </button>
            </div>
        </div>,
        document.body
    )
}
