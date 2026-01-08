import { useState } from 'react'
import { X, Trash2, Type, Hash, List, Calendar, CheckSquare, Users, Settings2, Tag, Tags } from 'lucide-react'
import type { BoardColumn, ColumnType } from '../../types'

interface ColumnSettingsModalProps {
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

export function ColumnSettingsModal({ column, onClose, onUpdate, onDelete }: ColumnSettingsModalProps) {
    const [name, setName] = useState(column.name)
    const [type, setType] = useState<ColumnType>(column.type)
    const [numberFormat, setNumberFormat] = useState(column.options?.numberFormat || 'number')
    const [statusOptions, setStatusOptions] = useState<any[]>(column.options?.options || [])

    const getColorHex = (color: string) => {
        const colors: any = { Gray: '#9b9b9b', Blue: '#5e87c9', Yellow: '#c29243', Green: '#529e72', Red: '#df5452', Orange: '#cc7d24', Purple: '#9d68d3', Pink: '#d15796' }
        return colors[color] || '#373737'
    }

    const handleSave = () => {
        onUpdate(column.id, {
            name,
            type,
            options: { ...column.options, numberFormat, options: statusOptions }
        })
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center md:items-center z-[120] p-0 md:p-4">
            <div className="bg-[#202020] border-t border-x md:border border-[#2f2f2f] w-full md:w-full md:max-w-sm rounded-t-2xl md:rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95">
                <div className="flex items-center justify-between p-4 border-b border-[#2f2f2f]">
                    <h2 className="text-xs font-bold text-[#8b8b8b] uppercase tracking-widest flex items-center gap-2">
                        <Settings2 size={14} />
                        Configurar Coluna
                    </h2>
                    <button onClick={onClose} className="text-[#8b8b8b] hover:text-white"><X size={18} /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8b8b8b] uppercase">Nome da Propriedade</label>
                        <input
                            className="w-full bg-[#191919] border border-[#2f2f2f] rounded px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#2383e2]"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8b8b8b] uppercase">Tipo de Dado</label>
                        <div className="grid grid-cols-1 gap-1">
                            {COLUMN_TYPES.map(ct => (
                                <button
                                    key={ct.type}
                                    onClick={() => setType(ct.type)}
                                    className={`flex items-center gap-3 p-2 rounded text-xs transition-all ${type === ct.type ? 'bg-[#2383e2]/10 text-[#2383e2]' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
                                >
                                    <ct.icon size={14} />
                                    <span>{ct.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {type === 'number' && (
                        <div className="space-y-2 pt-2 border-t border-[#2f2f2f]">
                            <label className="text-[10px] font-bold text-[#8b8b8b] uppercase">Formato do Número</label>
                            <select
                                className="w-full bg-[#191919] border border-[#2f2f2f] rounded px-2 py-2 text-xs text-white outline-none"
                                value={numberFormat}
                                onChange={(e) => setNumberFormat(e.target.value)}
                            >
                                {NUMBER_FORMATS.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                            </select>
                        </div>
                    )}

                    {(type === 'status' || type === 'select' || type === 'multiselect') && (
                        <div className="space-y-4 pt-2 border-t border-[#2f2f2f]">
                            <label className="text-[10px] font-bold text-[#8b8b8b] uppercase">Opções {type === 'status' ? 'de Status' : ''}</label>
                            <div className="space-y-2">
                                {statusOptions.map((opt: any, idx: number) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: getColorHex(opt.color) }} />
                                        <input
                                            className="flex-1 bg-[#191919] border border-[#2f2f2f] rounded px-2 py-1.5 text-xs text-white outline-none focus:border-[#2383e2]"
                                            value={opt.label}
                                            onChange={(e) => {
                                                const newOptions = [...statusOptions]
                                                newOptions[idx].label = e.target.value
                                                newOptions[idx].id = e.target.value // simple id sync
                                                setStatusOptions(newOptions)
                                            }}
                                        />
                                        <button
                                            onClick={() => setStatusOptions(statusOptions.filter((_: any, i: number) => i !== idx))}
                                            className="p-1 text-[#8b8b8b] hover:text-red-400"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => setStatusOptions([...statusOptions, { id: `new_${Date.now()}`, label: 'Nova Opção', color: 'Gray' }])}
                                    className="flex items-center gap-2 text-xs text-[#2383e2] hover:text-[#2a8ff5] font-medium mt-2"
                                >
                                    <List size={14} />
                                    Adicionar Opção
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex flex-col gap-2">
                        <button
                            onClick={handleSave}
                            className="w-full bg-[#2383e2] hover:bg-[#2a8ff5] text-white py-2 rounded font-bold text-xs shadow-lg shadow-[#2383e2]/20"
                        >
                            SALVAR ALTERAÇÕES
                        </button>
                        <button
                            onClick={() => { if (confirm('Excluir esta coluna e todos os dados nela?')) { onDelete(column.id); onClose(); } }}
                            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-400 hover:bg-red-400/10 rounded transition-all"
                        >
                            <Trash2 size={14} />
                            EXCLUIR COLUNA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
