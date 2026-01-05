import { useState } from 'react'
import { useAuthStore } from '../../store/useAuthStore'
import { useBoardStore } from '../../store/useBoardStore'
import { X } from 'lucide-react'

interface CreateBoardModalProps {
    onClose: () => void
}

export function CreateBoardModal({ onClose }: CreateBoardModalProps) {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const { user } = useAuthStore()
    const { createBoard } = useBoardStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim() || !user) return

        setLoading(true)
        const board = await createBoard(name, user.id)
        setLoading(false)

        if (board) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end justify-center md:items-center p-0 md:p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-[#191919] border-t border-x md:border border-[#2f2f2f] w-full md:w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 md:duration-200 md:zoom-in-95">
                <div className="px-6 py-4 flex items-center justify-between border-b border-[#2f2f2f]">
                    <h2 className="text-sm font-bold text-[#8b8b8b] uppercase tracking-wider">Criar Novo Quadro</h2>
                    <button onClick={onClose} className="text-[#8b8b8b] hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-[#8b8b8b] uppercase tracking-widest">Nome do Quadro</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-[#202020] border border-[#2f2f2f] p-4 rounded-md focus:ring-1 focus:ring-[#2383e2] outline-none transition-all text-lg placeholder:text-white/10"
                            placeholder="Digite o título do seu projeto..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-[#8b8b8b] hover:bg-[#2c2c2c] rounded-md transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name.trim()}
                            className="flex-1 bg-[#2383e2] hover:bg-[#2a8ff5] disabled:opacity-50 text-white font-bold py-3 rounded-md transition-all shadow-lg shadow-[#2383e2]/10"
                        >
                            {loading ? 'Criando...' : 'Criar Quadro'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
