import { useState } from 'react'
import { X, Trash2, Type, Hash, List, Calendar, CheckSquare, Users, Settings2 } from 'lucide-react'
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

    const handleSave = () => {
        onUpdate(column.id, {
            name,
            type,
            options: { ...column.options, numberFormat }
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
