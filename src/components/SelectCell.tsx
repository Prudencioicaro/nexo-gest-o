import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Search, Check, X } from 'lucide-react'

interface SelectOption {
    id: string
    label: string
    color: string
}

const OPTION_COLORS = [
    { name: 'Default', bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.6)' },
    { name: 'Gray', bg: 'rgba(155,155,155,0.15)', text: '#9B9B9B' },
    { name: 'Blue', bg: 'rgba(35,131,226,0.15)', text: '#2383E2' },
    { name: 'Teal', bg: 'rgba(10,157,174,0.15)', text: '#0A9DAE' },
    { name: 'Green', bg: 'rgba(11,138,94,0.15)', text: '#0B8A5E' },
    { name: 'Yellow', bg: 'rgba(223,171,1,0.15)', text: '#DFAB01' },
    { name: 'Orange', bg: 'rgba(215,107,0,0.15)', text: '#D76B00' },
    { name: 'Pink', bg: 'rgba(227,75,169,0.15)', text: '#E34BA9' },
    { name: 'Purple', bg: 'rgba(124,58,237,0.15)', text: '#7C3AED' },
    { name: 'Red', bg: 'rgba(220,38,38,0.15)', text: '#DC2626' },
]

interface SelectCellProps {
    value: string | string[]
    options: SelectOption[]
    onChange: (value: string | string[]) => void
    onUpdateOptions: (options: SelectOption[]) => void
    multiple?: boolean
}

export function SelectCell({ value, options = [], onChange, onUpdateOptions, multiple = false }: SelectCellProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedValues = useMemo(() =>
        multiple
            ? (Array.isArray(value) ? value : value ? [value] : [])
            : (value ? [value as string] : []),
        [value, multiple])

    const updateCoords = () => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            setCoords({
                top: rect.bottom,
                left: rect.left,
                width: Math.max(rect.width, 280)
            })
        }
    }

    const handleOpen = (e: React.MouseEvent) => {
        e.stopPropagation()
        updateCoords()
        setIsOpen(true)
    }

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('scroll', updateCoords, true)
            window.addEventListener('resize', updateCoords)
        }
        return () => {
            window.removeEventListener('scroll', updateCoords, true)
            window.removeEventListener('resize', updateCoords)
        }
    }, [isOpen])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // Check if click is on the portal dropdown
                const dropdown = document.getElementById('select-dropdown-portal')
                if (dropdown && !dropdown.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    const getColorStyle = (colorName: string) => {
        const color = OPTION_COLORS.find(c => c.name === colorName) || OPTION_COLORS[0]
        return { backgroundColor: color.bg, color: color.text }
    }

    const handleSelectOption = (optionLabel: string) => {
        if (multiple) {
            const newValues = selectedValues.includes(optionLabel)
                ? selectedValues.filter(v => v !== optionLabel)
                : [...selectedValues, optionLabel]
            onChange(newValues)
        } else {
            onChange(selectedValues[0] === optionLabel ? '' : optionLabel)
            setIsOpen(false)
        }
    }

    const handleCreateOption = () => {
        const trimmedSearch = search.trim()
        if (!trimmedSearch) return

        const existing = options.find(o => o.label.toLowerCase() === trimmedSearch.toLowerCase())
        if (existing) {
            handleSelectOption(existing.label)
            setSearch('')
            return
        }

        const newOption: SelectOption = {
            id: crypto.randomUUID(),
            label: trimmedSearch,
            color: OPTION_COLORS[Math.floor(Math.random() * (OPTION_COLORS.length - 1)) + 1].name
        }

        const newOptions = [...options, newOption]
        onUpdateOptions(newOptions)

        if (multiple) {
            onChange([...selectedValues, newOption.label])
        } else {
            onChange(newOption.label)
            setIsOpen(false)
        }
        setSearch('')
    }

    const filteredOptions = useMemo(() =>
        options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())),
        [options, search])

    const displayOptions = useMemo(() =>
        options.filter(o => selectedValues.includes(o.label)),
        [options, selectedValues])

    const dropdown = isOpen && createPortal(
        <div
            id="select-dropdown-portal"
            className="fixed z-[999] bg-[#09090b] border border-white/[0.08] rounded-[24px] shadow-luxury overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-4"
            style={{
                top: `${coords.top + 8}px`,
                left: `${coords.left}px`,
                width: `${coords.width}px`
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex items-center gap-3 px-3 py-2.5 mb-4 bg-white/[0.03] rounded-2xl border border-white/[0.05] focus-within:border-primary/40 focus-within:bg-white/[0.05] transition-luxury">
                <Search size={14} className="text-white/20" />
                <input
                    autoFocus
                    className="bg-transparent border-none outline-none text-xs text-white w-full placeholder:text-white/10 font-medium"
                    placeholder="Pesquisar ou digite para criar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleCreateOption()
                        } else if (e.key === 'Escape') {
                            setIsOpen(false)
                        }
                    }}
                />
            </div>

            <div className="max-h-60 overflow-y-auto no-scrollbar space-y-1">
                <p className="px-3 py-1 text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Opções disponíveis</p>

                {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => {
                        const isSelected = selectedValues.includes(option.label)
                        return (
                            <button
                                key={option.id}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-luxury group/opt ${isSelected ? 'bg-primary/10' : 'hover:bg-white/[0.03]'}`}
                                onClick={() => handleSelectOption(option.label)}
                            >
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2.5 h-2.5 rounded-full border border-white/5"
                                        style={{ backgroundColor: getColorStyle(option.color).color }}
                                    />
                                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-white/60 group-hover/opt:text-white'}`}>
                                        {option.label}
                                    </span>
                                </div>
                                {isSelected && <Check size={14} className="text-primary" />}
                            </button>
                        )
                    })
                ) : search ? (
                    <button
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/[0.03] text-xs text-primary transition-luxury border border-dashed border-primary/20"
                        onClick={handleCreateOption}
                    >
                        <div className="p-1.5 rounded-lg bg-primary/10">
                            <Plus size={14} />
                        </div>
                        <div className="text-left font-sans">
                            <p className="font-bold">Criar opção</p>
                            <p className="text-[10px] opacity-60">" {search} "</p>
                        </div>
                    </button>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-white/10">
                        <Search size={24} className="mb-2 opacity-50" />
                        <p className="text-[11px] font-bold uppercase tracking-wider">Nada encontrado</p>
                    </div>
                )}
            </div>

            {displayOptions.length > 0 && multiple && (
                <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-1.5">
                    {displayOptions.map(opt => (
                        <div
                            key={opt.id}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-white/[0.05]"
                            style={getColorStyle(opt.color)}
                        >
                            <span className="text-[10px] font-bold">{opt.label}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleSelectOption(opt.label)
                                }}
                                className="hover:scale-110 transition-luxury"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>,
        document.body
    )

    return (
        <div className="relative w-full h-full group" ref={containerRef}>
            <div
                className="w-full h-full flex items-center gap-1.5 cursor-pointer hover:bg-white/[0.04] px-1 rounded-lg transition-luxury overflow-hidden"
                onClick={handleOpen}
            >
                {displayOptions.length > 0 ? (
                    <div className="flex items-center gap-1.5 overflow-hidden">
                        {displayOptions.slice(0, multiple ? 3 : 1).map(opt => (
                            <span
                                key={opt.id}
                                className="px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-luxury border border-white/[0.05]"
                                style={getColorStyle(opt.color)}
                            >
                                {opt.label}
                            </span>
                        ))}
                        {multiple && displayOptions.length > 3 && (
                            <span className="text-[10px] text-white/20 font-bold px-1 uppercase tracking-wider">
                                +{displayOptions.length - 3}
                            </span>
                        )}
                    </div>
                ) : (
                    <span className="text-white/10 text-xs px-2 font-medium group-hover:text-white/30 transition-luxury">Vazio...</span>
                )}
            </div>
            {dropdown}
        </div>
    )
}
