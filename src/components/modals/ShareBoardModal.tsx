import { useState, useEffect } from 'react'
import { X, Link as LinkIcon, Mail, Check, UserPlus, Shield, Trash2, Loader2, Globe } from 'lucide-react'
import { useBoardDetailStore } from '../../store/useBoardDetailStore'
import type { Board } from '../../types'

interface ShareBoardModalProps {
    board: Board
    onClose: () => void
}

export function ShareBoardModal({ board, onClose }: ShareBoardModalProps) {
    const { members, inviteMember, removeMember, fetchMembers } = useBoardDetailStore()
    const [email, setEmail] = useState('')
    const [isInviting, setIsInviting] = useState(false)
    const [isCopied, setIsCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchMembers(board.id)
    }, [board.id, fetchMembers])

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return

        setIsInviting(true)
        setError(null)
        try {
            await inviteMember(board.id, email.trim())
            setEmail('')
        } catch (err: any) {
            setError(err.message || 'Erro ao convidar usuário.')
        } finally {
            setIsInviting(false)
        }
    }

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href)
        setIsCopied(true)
        setTimeout(() => setIsCopied(false), 2000)
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="bg-[#1c1c1c] border border-white/5 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">Compartilhar quadro</h2>
                        <p className="text-xs text-white/40">Gerencie quem tem acesso a este projeto.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Scenario 1: Copy Link */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <LinkIcon size={12} />
                            <span>Link de acesso</span>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-black/20 border border-white/5 rounded-xl px-3 py-2 text-xs text-white/40 truncate flex items-center">
                                {window.location.href}
                            </div>
                            <button
                                onClick={copyLink}
                                className={`px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 ${isCopied ? 'bg-[#529e72] text-white' : 'bg-white text-black hover:bg-white/90'}`}
                            >
                                {isCopied ? <Check size={14} /> : <LinkIcon size={14} />}
                                {isCopied ? 'Copiado' : 'Copiar'}
                            </button>
                        </div>
                    </div>

                    {/* Scenario 2: Invite User */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <Mail size={12} />
                            <span>Convidar por e-mail</span>
                        </div>
                        <form onSubmit={handleInvite} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="exemplo@email.com"
                                className="flex-1 bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-[#2383e2] transition-all placeholder:text-white/10"
                            />
                            <button
                                type="submit"
                                disabled={isInviting || !email.trim()}
                                className="bg-[#2383e2] hover:bg-[#1a5fb4] disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
                            >
                                {isInviting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                                Convidar
                            </button>
                        </form>
                        {error && <p className="text-[10px] text-red-400 font-medium px-1">{error}</p>}
                    </div>

                    {/* Members List */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 uppercase tracking-widest">
                            <Shield size={12} />
                            <span>Membros com acesso</span>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto custom-scrollbar space-y-2 pr-2">
                            {members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2c2c2c] to-[#191919] border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                                            {member.profiles?.email?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-xs font-bold text-white truncate">{member.profiles?.email}</p>
                                            <p className="text-[10px] text-white/30 capitalize">{member.role}</p>
                                        </div>
                                    </div>
                                    {member.role !== 'owner' && (
                                        <button
                                            onClick={() => removeMember(member.id)}
                                            className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 rounded-lg text-white/20 hover:text-red-400 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Tip */}
                <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-2 justify-center">
                    <Globe size={12} className="text-white/20" />
                    <p className="text-[10px] text-white/20 font-medium">Acesso restrito a membros convidados.</p>
                </div>
            </div>
        </div>
    )
}
