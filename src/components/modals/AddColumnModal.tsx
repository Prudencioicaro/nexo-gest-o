import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Type, List, Calendar, Hash, CheckSquare, ChevronRight, Users, Tag, Tags, Plus, X, ChevronDown } from 'lucide-react'
import type { ColumnType } from '../../types'

interface StatusOption {
    id: string
    label: string
    color: string
}

// Cores acessíveis para daltonismo (variação de luminosidade)
const NOTION_COLORS = ['Gray', 'Blue', 'Teal', 'Green', 'Yellow', 'Orange', 'Pink', 'Purple', 'Red']

const NUMBER_FORMATS = [
    { id: 'number', label: 'Número' },
    { id: 'decimal', label: 'Com vírgula (0.00)' },
    { id: 'currency_brl', label: 'Reais (R$)' },
    { id: 'currency_usd', label: 'Dólar ($)' },
]

interface AddColumnDropdownProps {
    onClose: () => void
    onAdd: (name: string, type: ColumnType, options?: any) => void
    anchorRef?: React.RefObject<HTMLElement | null>
}

const COLUMN_TYPES: { type: ColumnType; label: string; icon: any; description: string }[] = [
    { type: 'text', label: 'Texto', icon: Type, description: 'Texto simples ou notas' },
    { type: 'status', label: 'Status', icon: List, description: 'Workflow: A fazer, Fazendo, Feito' },
    { type: 'select', label: 'Selecionar', icon: Tag, description: 'Escolha uma opção' },
    { type: 'multiselect', label: 'Seleção Múltipla', icon: Tags, description: 'Escolha várias opções' },
    { type: 'date', label: 'Data', icon: Calendar, description: 'Datas e prazos' },
    { type: 'number', label: 'Número', icon: Hash, description: 'Valores e quantidades' },
    { type: 'boolean', label: 'Checkbox', icon: CheckSquare, description: 'Sim/Não' },
    { type: 'person', label: 'Pessoas', icon: Users, description: 'Membros do quadro' },
]

export function AddColumnDropdown({ onClose, onAdd }: AddColumnDropdownProps) {
    const [step, setStep] = useState<'type' | 'name' | 'options' | 'number_config'>('type')
    const [selectedType, setSelectedType] = useState<ColumnType | null>(null)
    const [name, setName] = useState('')
    const [numberFormat, setNumberFormat] = useState('number')
    const [coords, setCoords] = useState<{ top: number, left: number } | null>(null)
    const [statusOptions, setStatusOptions] = useState<StatusOption[]>([
        { id: 'opt1', label: 'Opção 1', color: 'Blue' },
        { id: 'opt2', label: 'Opção 2', color: 'Green' },
        { id: 'opt3', label: 'Opção 3', color: 'Yellow' },
    ])
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const updateCoords = () => {
        const anchor = document.getElementById('add-column-button')
        if (anchor) {
            const rect = anchor.getBoundingClientRect()
            setCoords({
                top: rect.bottom,
                left: rect.left - 240 // Offset to the left since it's on the right edge
            })
        }
    }

    useEffect(() => {
        updateCoords()
        window.addEventListener('scroll', updateCoords, true)
        window.addEventListener('resize', updateCoords)
        return () => {
            window.removeEventListener('scroll', updateCoords, true)
            window.removeEventListener('resize', updateCoords)
        }
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const portal = document.getElementById('add-column-portal')
            if (portal && !portal.contains(event.target as Node)) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [onClose])

    useEffect(() => {
        if ((step === 'name' || step === 'options' || step === 'number_config') && inputRef.current) {
            inputRef.current.focus()
        }
    }, [step])

    const handleTypeSelect = (type: ColumnType) => {
        setSelectedType(type)
        const typeLabel = COLUMN_TYPES.find(t => t.type === type)?.label || ''
        setName(typeLabel)

        if (type === 'status' || type === 'select' || type === 'multiselect') {
            if (type === 'status') {
                setStatusOptions([
                    { id: 'backlog', label: 'Backlog', color: 'Gray' },
                    { id: 'todo', label: 'A Fazer', color: 'Blue' },
                    { id: 'in_progress', label: 'Em Andamento', color: 'Yellow' },
                    { id: 'done', label: 'Concluído', color: 'Green' },
                ])
            } else {
                setStatusOptions([
                    { id: 'opt1', label: 'Opção 1', color: 'Blue' },
                    { id: 'opt2', label: 'Opção 2', color: 'Green' },
                ])
            }
            setStep('options')
        } else if (type === 'number') {
            setStep('number_config')
        } else {
            setStep('name')
        }
    }

    const handleAddOption = () => {
        const newOption: StatusOption = {
            id: `opt_${Date.now()}`,
            label: `Opção ${statusOptions.length + 1}`,
            color: NOTION_COLORS[statusOptions.length % NOTION_COLORS.length]
        }
        setStatusOptions([...statusOptions, newOption])
    }

    const handleRemoveOption = (id: string) => {
        setStatusOptions(statusOptions.filter(o => o.id !== id))
    }

    const handleSubmit = () => {
        if (!name.trim() || !selectedType) return

        let options: any = {}
        if (selectedType === 'status' || selectedType === 'select' || selectedType === 'multiselect') {
            options = { options: statusOptions }
        } else if (selectedType === 'number') {
            options = { numberFormat }
        }

        onAdd(name, selectedType, options)
        onClose()
    }

    const getColorHex = (color: string) => {
        const colors: Record<string, string> = {
            Gray: '#9B9B9B',
            Blue: '#2383E2',
            Teal: '#0A9DAE',
            Green: '#0B8A5E',
            Yellow: '#DFAB01',
            Orange: '#D76B00',
            Pink: '#E34BA9',
            Purple: '#7C3AED',
            Red: '#DC2626'
        }
        return colors[color] || '#373737'
    }

    if (!coords) return null

    return createPortal(
        <div
            id="add-column-portal"
            ref={containerRef}
            className="fixed z-[999] w-80 bg-[#09090b] border border-white/[0.08] rounded-[24px] shadow-luxury overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            style={{
                top: `${coords.top + 8}px`,
                left: `${coords.left}px`
            }}
        >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/[0.03] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {step !== 'type' && (
                        <button
                            onClick={() => setStep('type')}
                            className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-luxury"
                        >
                            <ChevronRight size={14} className="rotate-180" />
                        </button>
                    )}
                    <h3 className="text-[11px] font-bold text-white/20 uppercase tracking-[2px]">
                        {step === 'type' && 'Tipo de Coluna'}
                        {step === 'name' && 'Nome da Coluna'}
                        {step === 'options' && 'Configurar Opções'}
                        {step === 'number_config' && 'Configurar Número'}
                    </h3>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-luxury">
                    <X size={14} />
                </button>
            </div>

            {/* Step 1: Type Selection */}
            {step === 'type' && (
                <div className="p-2 max-h-80 overflow-y-auto no-scrollbar">
                    {COLUMN_TYPES.map((item) => (
                        <button
                            key={item.type}
                            onClick={() => handleTypeSelect(item.type)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-luxury group text-left"
                        >
                            <div className="p-2 rounded-lg bg-white/5 text-white/20 group-hover:text-primary group-hover:bg-primary/10 transition-luxury">
                                <item.icon size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-white/60 group-hover:text-white transition-luxury">{item.label}</p>
                                <p className="text-[10px] text-white/20 truncate">{item.description}</p>
                            </div>
                            <ChevronRight size={12} className="text-white/10 group-hover:text-white/40" />
                        </button>
                    ))}
                </div>
            )}

            {/* Step 2: Name Input */}
            {step === 'name' && (
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Nome</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                            placeholder="Nome da coluna..."
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-luxury"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-30 text-xs font-bold py-3 rounded-xl transition-luxury shadow-xl"
                    >
                        CRIAR COLUNA
                    </button>
                </div>
            )}

            {/* Step: Number Configuration */}
            {step === 'number_config' && (
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Nome</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome da coluna..."
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-luxury"
                        />
                    </div>

                    <div className="space-y-2">
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
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim()}
                        className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-30 text-xs font-bold py-3 rounded-xl transition-luxury shadow-xl"
                    >
                        CRIAR COLUNA
                    </button>
                </div>
            )}

            {/* Step: Options Configuration */}
            {step === 'options' && (
                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider px-1">Nome</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nome da coluna..."
                            className="w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/40 focus:bg-white/[0.04] transition-luxury"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-white/20 uppercase tracking-wider">Opções</label>
                            <button
                                onClick={handleAddOption}
                                className="text-[10px] font-bold text-primary hover:text-primary/80 transition-luxury flex items-center gap-1"
                            >
                                <Plus size={10} />
                                ADICIONAR
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto no-scrollbar">
                            {statusOptions.map((opt, idx) => (
                                <div key={opt.id} className="flex items-center gap-2 group">
                                    <div
                                        className="w-6 h-6 rounded-lg shrink-0 cursor-pointer border border-white/10 transition-luxury hover:scale-110"
                                        style={{ backgroundColor: getColorHex(opt.color) }}
                                        onClick={() => {
                                            const newOptions = [...statusOptions]
                                            const currentIdx = NOTION_COLORS.indexOf(opt.color)
                                            newOptions[idx].color = NOTION_COLORS[(currentIdx + 1) % NOTION_COLORS.length]
                                            setStatusOptions(newOptions)
                                        }}
                                    />
                                    <input
                                        type="text"
                                        value={opt.label}
                                        onChange={(e) => {
                                            const newOptions = [...statusOptions]
                                            newOptions[idx].label = e.target.value
                                            newOptions[idx].id = e.target.value.toLowerCase().replace(/\s+/g, '_')
                                            setStatusOptions(newOptions)
                                        }}
                                        className="flex-1 bg-white/[0.02] border border-white/[0.05] rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-primary/40 transition-luxury"
                                    />
                                    <button
                                        onClick={() => handleRemoveOption(opt.id)}
                                        className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-luxury"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || statusOptions.length === 0}
                        className="w-full bg-white text-black hover:bg-neutral-200 disabled:opacity-30 text-xs font-bold py-3 rounded-xl transition-luxury shadow-xl"
                    >
                        CRIAR COLUNA
                    </button>
                </div>
            )}
        </div>,
        document.body
    )
}

export { AddColumnDropdown as AddColumnModal }
