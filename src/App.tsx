import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/useAuthStore'
import { useBoardStore } from './store/useBoardStore'
import { AuthPage } from './pages/AuthPage'
import { CreateBoardModal } from './components/modals/CreateBoardModal'
import { ShareBoardModal } from './components/modals/ShareBoardModal'
import { LandingPage } from './pages/LandingPage'
import { BoardViewPage } from './pages/BoardViewPage'
import { useToast } from './components/Toast'
import { EditableText } from './components/EditableText'
import {
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Hash,
  PlusCircle,
  Share2,
  Menu,
  Trash2,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  Edit2
} from 'lucide-react'
import type { Board } from './types'

function App() {
  const { user, loading: authLoading, setUser } = useAuthStore()
  const { boards, fetchBoards, deleteBoard, updateBoard } = useBoardStore()
  const { addToast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)
  const [boardMenuOpen, setBoardMenuOpen] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      await new Promise(resolve => setTimeout(resolve, 2000))
      useAuthStore.setState({ loading: false })
    }
    initAuth()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    if (user) fetchBoards()
  }, [user, fetchBoards])

  const handleDeleteBoard = async (boardId: string) => {
    if (confirmDeleteId !== boardId) {
      setConfirmDeleteId(boardId)
      return
    }
    const boardName = boards.find(b => b.id === boardId)?.name || 'Quadro'
    setBoardMenuOpen(null)
    setConfirmDeleteId(null)
    if (selectedBoard?.id === boardId) setSelectedBoard(null)
    const { error } = await deleteBoard(boardId)
    if (error) {
      addToast('Erro ao excluir: Tente recarregar a página', 'error')
      return
    }
    addToast(`"${boardName}" excluído com sucesso`, 'success')
  }

  const handleUpdateBoardName = async (boardId: string, newName: string) => {
    await updateBoard(boardId, { name: newName })
    if (selectedBoard?.id === boardId) setSelectedBoard({ ...selectedBoard, name: newName })
    addToast('Nome atualizado', 'success')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="relative animate-pulse">
            <img src="/logo.png" alt="NEXO" className="h-20 w-auto brightness-200 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]" />
          </div>
          <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[progress_2s_ease-out_forwards]" />
          </div>
        </div>
        <style>{`@keyframes progress { 0% { width: 0%; } 100% { width: 100%; } }`}</style>
      </div>
    )
  }

  if (!user) {
    return showLanding ? <LandingPage onAuth={() => setShowLanding(false)} /> : <AuthPage />
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground flex overflow-hidden font-sans">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`glass-surface flex flex-col fixed lg:relative h-screen transition-luxury z-[101] lg:z-[101] shrink-0
          ${isMobileMenuOpen ? 'translate-x-0 w-full md:w-80 lg:w-64' : '-translate-x-full lg:translate-x-0'} 
          ${isSidebarCollapsed ? 'lg:w-0' : 'lg:w-64'}`}>

        <div className={`transition-luxury flex flex-col h-full ${isSidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
          <div className="p-4 mb-2">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/[0.03] transition-luxury cursor-pointer group active:scale-[0.98]">
              <div className="w-9 h-9 flex items-center justify-center bg-white/[0.05] rounded-xl border border-white/[0.05]">
                <img src="/logo.png" alt="Nexo" className="w-6 h-auto brightness-200" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="text-[13px] font-semibold text-white/90 truncate px-1 tracking-tight">Espaço Nexo</h2>
                <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-60 transition-opacity">
                  <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Online</span>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setIsSidebarCollapsed(true) }} className="hidden lg:flex p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-luxury">
                <ChevronsLeft size={14} />
              </button>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-6 overflow-y-auto no-scrollbar py-2">
            <div className="space-y-1">
              <p className="px-3 pb-2 text-[9px] font-bold text-white/20 uppercase tracking-[2px]">Geral</p>
              <button onClick={() => setSelectedBoard(null)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-luxury group ${!selectedBoard ? 'sidebar-item-active text-white bg-white/[0.03]' : 'text-white/40 hover:bg-white/[0.03] hover:text-white/80'}`}>
                <LayoutDashboard size={16} className={!selectedBoard ? 'text-primary' : 'group-hover:scale-110 transition-luxury'} />
                <span className="text-[13px] font-medium tracking-tight">Dashboard</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-3 pb-2 flex items-center justify-between group/title">
                <p className="text-[9px] font-bold text-white/20 uppercase tracking-[2px]">Projetos</p>
                <button onClick={() => setShowCreateModal(true)} className="opacity-0 group-hover/title:opacity-100 hover:text-white text-white/20 transition-luxury">
                  <PlusCircle size={14} />
                </button>
              </div>
              <div className="space-y-0.5">
                {boards.map(board => (
                  <div key={board.id} className="relative group/board">
                    <div onClick={() => setSelectedBoard(board)} className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-lg transition-luxury group cursor-pointer ${selectedBoard?.id === board.id ? 'sidebar-item-active text-white bg-white/[0.03]' : 'text-white/40 hover:bg-white/[0.03] hover:text-white/80'}`}>
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: board.color || '#3b82f6' }} />
                      <div className="flex-1 min-w-0">
                        {editingBoardId === board.id ? (
                          <EditableText value={board.name} onSave={(newName) => { handleUpdateBoardName(board.id, newName); setEditingBoardId(null); }} className="text-[13px] font-medium text-white block text-left" onCancel={() => setEditingBoardId(null)} autoEditing={true} />
                        ) : (
                          <span className="text-[13px] font-medium truncate block text-left tracking-tight">{board.name}</span>
                        )}
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setBoardMenuOpen(boardMenuOpen === board.id ? null : board.id); setConfirmDeleteId(null); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover/board:opacity-100 hover:bg-white/10 text-white/20 hover:text-white transition-luxury">
                      <MoreHorizontal size={14} />
                    </button>
                    {boardMenuOpen === board.id && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-[#0f0f11] border border-white/[0.05] rounded-lg shadow-2xl z-[200] overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1" onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                        <button onClick={() => { setEditingBoardId(board.id); setBoardMenuOpen(null); }} className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-md transition-luxury">
                          <Edit2 size={13} />
                          <span>Renomear</span>
                        </button>
                        <div className="h-px bg-white/5 my-1" />
                        <button onClick={() => handleDeleteBoard(board.id)} className={`w-full flex items-center gap-3 px-3 py-2 text-left text-[13px] rounded-md transition-luxury ${confirmDeleteId === board.id ? 'text-white bg-red-500/80 hover:bg-red-500' : 'text-red-400/70 hover:text-red-400 hover:bg-red-400/5'}`}>
                          <Trash2 size={13} />
                          <span className="font-medium">{confirmDeleteId === board.id ? 'Confirmar Exclusão' : 'Excluir Projeto'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </nav>

          <div className="p-4 mt-auto">
            <div className="p-2 py-2.5 bg-white/[0.02] rounded-xl border border-white/5 flex items-center gap-3 group relative transition-luxury hover:bg-white/[0.05]">
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-[12px] font-medium text-white/80 truncate leading-none mb-1">{user.email?.split('@')[0]}</p>
                <p className="text-[9px] text-white/20 font-medium tracking-wide uppercase truncate leading-none">Pessoal</p>
              </div>
              <button onClick={() => useAuthStore.getState().signOut()} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-luxury">
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>

        <div onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="absolute top-0 right-0 w-1 h-full cursor-pointer group/handle z-50 hover:bg-primary/40 transition-colors hidden lg:block">
          <button className={`absolute top-12 -right-3 w-6 h-6 bg-background border border-white/10 rounded-full flex items-center justify-center shadow-xl transition-luxury opacity-0 group-hover/handle:opacity-100 hover:scale-110 ${isSidebarCollapsed ? 'rotate-180 opacity-100' : ''}`}>
            <ChevronRight size={12} className="text-white/40" />
          </button>
        </div>
      </aside>

      {boardMenuOpen && (
        <div className="fixed inset-0 z-[90]" onClick={() => { setBoardMenuOpen(null); setConfirmDeleteId(null); }} />
      )}

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <header className="h-14 px-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-xl z-30 shrink-0">
          <div className="flex items-center gap-4 text-sm overflow-hidden truncate">
            {isSidebarCollapsed && (
              <button onClick={() => setIsSidebarCollapsed(false)} className="p-1.5 hover:bg-white/5 rounded text-white/40 hover:text-white transition-luxury">
                <ChevronsRight size={16} />
              </button>
            )}
            <div className="flex items-center gap-2.5 text-white/30 text-[13px] font-medium">
              <span className="hover:text-white/60 cursor-pointer transition-luxury" onClick={() => setSelectedBoard(null)}>Dashboard</span>
              {selectedBoard && (
                <>
                  <ChevronRight size={12} className="opacity-20" />
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedBoard.color || '#3b82f6' }} />
                    <EditableText value={selectedBoard.name} onSave={(newName) => handleUpdateBoardName(selectedBoard.id, newName)} className="text-[13px] font-medium" />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {selectedBoard && (
              <button onClick={() => setShowShareModal(true)} className="px-4 py-1.5 bg-primary text-white text-[11px] font-bold rounded-full transition-luxury hover:brightness-110 flex items-center gap-2 shadow-glow-primary">
                <Share2 size={12} />
                <span>COMPARTILHAR</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {selectedBoard ? (
            <BoardViewPage board={selectedBoard} onBack={() => setSelectedBoard(null)} />
          ) : (
            <div className="flex flex-col h-full overflow-y-auto no-scrollbar p-6 lg:p-10">
              <div className="max-w-6xl mx-auto w-full space-y-16 py-8">
                <div className="relative p-12 rounded-[32px] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/[0.05] overflow-hidden group/hero">
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover/hero:bg-primary/10 transition-luxury duration-1000" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="text-center md:text-left space-y-4">
                      <h1 className="text-4xl md:text-6xl font-semibold text-white tracking-tight leading-none">Projetos</h1>
                      <p className="text-base md:text-lg text-white/40 font-medium max-w-sm leading-relaxed">
                        Gerencie seus fluxos de trabalho com clareza e elegância.
                      </p>
                    </div>
                    <button onClick={() => setShowCreateModal(true)} className="px-8 py-4 bg-white text-black hover:bg-[#f0f0f0] rounded-full font-bold text-xs flex items-center gap-2.5 transition-luxury active:scale-[0.98] shadow-2xl shrink-0">
                      <PlusCircle size={16} />
                      CRIAR NOVO PROJETO
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-semibold text-white/90 tracking-tight">Seus Projetos</h3>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">{boards.length} TOTAL</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board, idx) => (
                      <div key={board.id} onClick={() => setSelectedBoard(board)} className="group relative bg-[#0f0f11] border border-white/[0.04] rounded-[24px] p-7 cursor-pointer transition-luxury hover:bg-[#141416] hover:border-white/[0.1] hover:-translate-y-1" style={{ transitionDelay: `${idx * 20}ms` }}>
                        <div className="flex items-start justify-between mb-8">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-luxury border border-white/[0.03]" style={{ backgroundColor: `${board.color || '#3b82f6'}10` }}>
                            <Hash size={24} style={{ color: board.color || '#3b82f6' }} />
                          </div>
                          <ChevronRight size={18} className="text-white/10 group-hover:text-white/40 transition-luxury" />
                        </div>
                        <h4 className="text-xl font-semibold text-white/90 mb-1.5 tracking-tight group-hover:text-primary transition-luxury">{board.name}</h4>
                        <p className="text-[11px] text-white/20 font-bold uppercase tracking-widest mb-8">Personalizado</p>
                        <div className="flex items-center justify-between">
                          <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">U</div>
                          <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: board.color || '#3b82f6', backgroundColor: 'currentColor' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {showCreateModal && (
        <CreateBoardModal onClose={() => setShowCreateModal(false)} onBoardCreated={(boardId) => {
          const newBoard = boards.find(b => b.id === boardId)
          if (newBoard) setSelectedBoard(newBoard)
        }} />
      )}
      {showShareModal && selectedBoard && (
        <ShareBoardModal board={selectedBoard} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}

export default App
