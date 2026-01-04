import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Check } from 'lucide-react'

interface StatusOption {
    id: string
    label: string
    color: string
}

const NOTION_COLORS = [
    { name: 'Default', bg: '#373737', text: '#ffffff' },
    { name: 'Gray', bg: '#454b4e', text: '#9b9b9b' },
    { name: 'Brown', bg: '#43403a', text: '#976d57' },
    { name: 'Orange', bg: '#594a3a', text: '#cc7d24' },
    { name: 'Yellow', bg: '#59543a', text: '#c29243' },
    { name: 'Green', bg: '#3a5948', text: '#529e72' },
    { name: 'Blue', bg: '#3a4a59', text: '#5e87c9' },
    { name: 'Purple', bg: '#4a3a59', text: '#9d68d3' },
    { name: 'Pink', bg: '#593a4a', text: '#d15796' },
    { name: 'Red', bg: '#593a3a', text: '#df5452' },
]

interface StatusSelectProps {
    value: string
    options: StatusOption[]
    onChange: (value: string) => void
    onUpdateOptions: (options: StatusOption[]) => void
}

export function StatusSelect({ value, options = [], onChange, onUpdateOptions }: StatusSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectedOption = options.find(o => o.label === value)

    const handleCreateOption = () => {
        if (!search.trim()) return
        const newOption: StatusOption = {
            id: crypto.randomUUID(),
            label: search.trim(),
            color: NOTION_COLORS[Math.floor(Math.random() * NOTION_COLORS.length)].name
        }
        const newOptions = [...options, newOption]
        onUpdateOptions(newOptions)
        onChange(newOption.label)
        setSearch('')
    }

    const filteredOptions = options.filter(o =>
        o.label.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative w-full h-full" ref={containerRef}>
            <div
                className="w-full h-full px-4 flex items-center cursor-pointer hover:bg-[#2c2c2c] transition-colors overflow-hidden"
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOption ? (
                    <div
                        className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                        style={{
                            backgroundColor: NOTION_COLORS.find(c => c.name === selectedOption.color)?.bg,
                            color: NOTION_COLORS.find(c => c.name === selectedOption.color)?.text
                        }}
                    >
                        {selectedOption.label}
                    </div>
                ) : (
                    <span className="text-[#8b8b8b] text-sm">Nenhum</span>
                )}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-[#202020] border border-[#2f2f2f] rounded-lg shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2">
                    <div className="flex items-center gap-2 px-2 py-1 mb-2 bg-[#191919] rounded border border-[#2f2f2f]">
                        <Search size={14} className="text-[#8b8b8b]" />
                        <input
                            autoFocus
                            className="bg-transparent border-none outline-none text-sm text-white w-full h-7"
                            placeholder="Pesquisar ou criar opção..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreateOption()}
                        />
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                        <p className="px-2 py-1 text-[10px] font-bold text-[#8b8b8b] uppercase tracking-wider">Opções</p>
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => (
                                <button
                                    key={option.id}
                                    className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#2c2c2c] transition-colors group"
                                    onClick={() => {
                                        onChange(option.label)
                                        setIsOpen(false)
                                    }}
                                >
                                    <div
                                        className="px-2 py-0.5 rounded text-xs font-medium"
                                        style={{
                                            backgroundColor: NOTION_COLORS.find(c => c.name === option.color)?.bg,
                                            color: NOTION_COLORS.find(c => c.name === option.color)?.text
                                        }}
                                    >
                                        {option.label}
                                    </div>
                                    {value === option.label && <Check size={14} className="text-[#2383e2]" />}
                                </button>
                            ))
                        ) : search ? (
                            <button
                                className="w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-[#2c2c2c] text-sm text-[#8b8b8b] transition-all"
                                onClick={handleCreateOption}
                            >
                                <Plus size={14} />
                                <span>Criar "<span className="text-white">{search}</span>"</span>
                            </button>
                        ) : (
                            <p className="px-2 py-4 text-xs text-[#8b8b8b] italic text-center">Nenhuma opção</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
