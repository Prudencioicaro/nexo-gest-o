import { useState } from 'react'
import { Filter as FilterIcon, X, Plus } from 'lucide-react'
import type { BoardColumn } from '../types'

export interface FilterRule {
    id: string
    columnId: string
    operator: 'equals' | 'contains' | 'not_equals' | 'is_empty' | 'is_not_empty'
    value: string
}

interface FilterMenuProps {
    columns: BoardColumn[]
    rules: FilterRule[]
    onChange: (rules: FilterRule[]) => void
}

export function FilterMenu({ columns, rules, onChange }: FilterMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const addRule = () => {
        const newRule: FilterRule = {
            id: crypto.randomUUID(),
            columnId: columns[0]?.id || '',
            operator: 'contains',
            value: ''
        }
        onChange([...rules, newRule])
    }

    const removeRule = (id: string) => {
        onChange(rules.filter(r => r.id !== id))
    }

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        onChange(rules.map(r => r.id === id ? { ...r, ...updates } : r))
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-1.5 px-3 h-7 rounded text-xs font-medium transition-all ${rules.length > 0 ? 'bg-[#2383e2]/10 text-[#2383e2] border border-[#2383e2]/30' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
            >
                <FilterIcon size={14} />
                <span>Filtro</span>
                {rules.length > 0 && <span className="bg-[#2383e2] text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">{rules.length}</span>}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-96 bg-[#202020] border border-[#2f2f2f] rounded-lg shadow-2xl z-[60] p-4 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-bold text-[#8b8b8b] uppercase tracking-widest">Filtros</span>
                        <button onClick={() => setIsOpen(false)} className="text-[#8b8b8b] hover:text-white"><X size={14} /></button>
                    </div>

                    <div className="space-y-3">
                        {rules.map(rule => (
                            <div key={rule.id} className="flex items-center gap-2">
                                <select
                                    className="flex-1 bg-[#191919] border border-[#2f2f2f] rounded px-2 py-1 text-xs text-white outline-none"
                                    value={rule.columnId}
                                    onChange={(e) => updateRule(rule.id, { columnId: e.target.value })}
                                >
                                    {columns.map(col => <option key={col.id} value={col.id}>{col.name}</option>)}
                                </select>

                                <select
                                    className="w-24 bg-[#191919] border border-[#2f2f2f] rounded px-2 py-1 text-xs text-white outline-none"
                                    value={rule.operator}
                                    onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                                >
                                    <option value="contains">Contém</option>
                                    <option value="equals">Igual</option>
                                    <option value="not_equals">Diferente</option>
                                    <option value="is_empty">Vazio</option>
                                </select>

                                <input
                                    className="flex-1 bg-[#191919] border border-[#2f2f2f] rounded px-2 py-1 text-xs text-white outline-none"
                                    placeholder="Valor..."
                                    value={rule.value}
                                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                                    disabled={rule.operator === 'is_empty'}
                                />

                                <button onClick={() => removeRule(rule.id)} className="text-[#8b8b8b] hover:text-red-400"><X size={14} /></button>
                            </div>
                        ))}

                        <button
                            onClick={addRule}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#8b8b8b] hover:bg-[#2c2c2c] rounded border border-dashed border-[#2f2f2f] transition-all"
                        >
                            <Plus size={14} />
                            <span>Adicionar Filtro</span>
                        </button>
                    </div>

                    {rules.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#2f2f2f] flex justify-end">
                            <button
                                onClick={() => onChange([])}
                                className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase"
                            >
                                Limpar Tudo
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
