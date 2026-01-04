import { useState } from 'react'
import { Type, List, Calendar, Hash, CheckSquare, X, ChevronRight, Users } from 'lucide-react'
import type { ColumnType } from '../../types'

interface AddColumnModalProps {
    onClose: () => void
    onAdd: (name: string, type: ColumnType) => void
}

const COLUMN_TYPES: { type: ColumnType; label: string; icon: any; description: string; color: string }[] = [
    { type: 'text', label: 'Texto', icon: Type, description: 'Texto simples ou notas curtas', color: 'text-[#8b8b8b]' },
    { type: 'status', label: 'Status / Seleção', icon: List, description: 'Opções como "A fazer", "Em progresso"', color: 'text-[#8b8b8b]' },
    { type: 'date', label: 'Data', icon: Calendar, description: 'Datas de entrega ou prazos', color: 'text-[#8b8b8b]' },
    { type: 'number', label: 'Número', icon: Hash, description: 'Valores, quantidades ou metas', color: 'text-[#8b8b8b]' },
    { type: 'boolean', label: 'Checkbox', icon: CheckSquare, description: 'Sim/Não ou Feito/Pendente', color: 'text-[#8b8b8b]' },
    { type: 'person', label: 'Pessoas', icon: Users, description: 'Atribua tarefas a membros do board', color: 'text-[#8b8b8b]' },
]

export function AddColumnModal({ onClose, onAdd }: AddColumnModalProps) {
    const [name, setName] = useState('')
    const [selectedType, setSelectedType] = useState<ColumnType>('text')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) return
        onAdd(name, selectedType)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
            <div className="bg-[#191919] border border-[#2f2f2f] w-full max-w-xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#2f2f2f]">
                    <h2 className="text-sm font-bold text-[#8b8b8b] uppercase tracking-wider">Nova Propriedade</h2>
                    <button onClick={onClose} className="text-[#8b8b8b] hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8b8b8b] uppercase tracking-[0.2em]">Título da Coluna</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-[#202020] border border-[#2f2f2f] p-4 rounded-md focus:ring-1 focus:ring-[#2383e2] outline-none transition-all text-lg"
                            placeholder="Ex: Prazo, Valor, Responsável..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#8b8b8b] uppercase tracking-[0.2em]">Tipo de Propriedade</label>
                        <div className="grid grid-cols-1 gap-1">
                            {COLUMN_TYPES.map((item) => (
                                <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => setSelectedType(item.type)}
                                    className={`flex items-center justify-between p-3 rounded-md transition-all group ${selectedType === item.type
                                        ? 'bg-[#2c2c2c]'
                                        : 'hover:bg-[#2c2c2c]/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-1.5 rounded bg-[#191919] border border-[#2f2f2f] ${selectedType === item.type ? 'text-[#2383e2]' : 'text-[#8b8b8b]'}`}>
                                            <item.icon size={16} />
                                        </div>
                                        <div>
                                            <p className={`font-semibold text-sm ${selectedType === item.type ? 'text-white' : 'text-[#acacac]'}`}>{item.label}</p>
                                        </div>
                                    </div>
                                    {selectedType === item.type && <ChevronRight size={14} className="text-[#2383e2]" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-[#2f2f2f]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-bold text-[#8b8b8b] hover:bg-[#2c2c2c] rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-[#2383e2] hover:bg-[#2a8ff5] text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-[#2383e2]/10"
                        >
                            Criar Propriedade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
