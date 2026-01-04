import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useAuthStore } from './store/useAuthStore'
import { useBoardStore } from './store/useBoardStore'
import { AuthPage } from './pages/AuthPage'
import { CreateBoardModal } from './components/modals/CreateBoardModal'
import { ShareBoardModal } from './components/modals/ShareBoardModal'
import { LandingPage } from './pages/LandingPage'
import { BoardViewPage } from './pages/BoardViewPage'
import {
  LogOut,
  LayoutDashboard,
  ChevronRight,
  Hash,
  PlusCircle,
  Share2,
  Menu
} from 'lucide-react'
import type { Board } from './types'

function App() {
  const { user, loading: authLoading, setUser } = useAuthStore()
  const { boards, fetchBoards } = useBoardStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLanding, setShowLanding] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)

      // Artificial delay to show the NEXO loader
      await new Promise(resolve => setTimeout(resolve, 3000))
      useAuthStore.setState({ loading: false })
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [setUser])

  useEffect(() => {
    if (user) {
      fetchBoards()
    }
  }, [user, fetchBoards])

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] overflow-hidden relative">
        {/* Ambient Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2383e2]/5 blur-[120px] rounded-full animate-pulse" />

        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Logo Animation Container */}
          <div className="relative group">
            {/* Outer Ring Animation */}
            <div className="absolute inset-0 -m-4 border border-[#2383e2]/20 rounded-full animate-[spin_4s_linear_infinite]" />
            <div className="absolute inset-0 -m-4 border-t-2 border-[#2383e2] rounded-full animate-[spin_2s_linear_infinite]" />

            <div className="animate-pulse duration-[2000ms]">
              <img
                src="/logo.png"
                alt="NEXO"
                className="h-24 w-auto brightness-200 drop-shadow-[0_0_30px_rgba(35,131,226,0.3)]"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="h-1 w-48 bg-white/5 rounded-full overflow-hidden relative">
              <div className="h-full bg-[#2383e2] animate-[progress_3s_ease-out_forwards]" />
            </div>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[4px] animate-pulse">
              Iniciando Nexo
            </p>
          </div>
        </div>

        <style>{`
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    )
  }

  if (!user) {
    if (showLanding) {
      return <LandingPage onAuth={() => setShowLanding(false)} />
    }
    return <AuthPage />
  }

  return (
    <div className="h-screen w-screen bg-[#191919] text-[#ffffff] flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`bg-[rgb(18,18,18)] flex flex-col fixed lg:relative h-screen transition-all duration-300 ease-in-out z-[101] lg:z-40 shrink-0
          ${isMobileMenuOpen ? 'translate-x-0 w-full md:w-80 lg:w-64' : '-translate-x-full lg:translate-x-0'} 
          ${isSidebarCollapsed ? 'lg:w-0' : 'lg:w-64'}`}
      >
        <div className={`transition-all duration-300 flex flex-col h-full overflow-hidden border-r border-white/5 ${isSidebarCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
          {/* Mobile Header in Sidebar */}
          <div className="lg:hidden p-4 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Nexo" className="h-6 w-auto brightness-200" />
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-lg text-white/40">
              <Menu size={20} />
            </button>
          </div>

          {/* Workspace Switcher */}
          <div className="p-4 mb-2">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group active:scale-[0.98]">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/logo.png" alt="Nexo" className="w-full h-auto brightness-200 scale-110" />
              </div>
              <div className="flex-1 overflow-hidden">
                <h2 className="text-[13px] font-bold text-white truncate px-1">Espaço Nexo</h2>
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-60 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-6 overflow-y-auto custom-scrollbar no-scrollbar py-2">
            {/* General Section */}
            <div className="space-y-1">
              <p className="px-2 pb-2 text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Geral</p>
              <button
                onClick={() => setSelectedBoard(null)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${!selectedBoard ? 'bg-[#2383e2]/10 text-[#2383e2] shadow-[inset_0_0_0_1px_rgba(35,131,226,0.2)]' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              >
                <LayoutDashboard size={18} className={!selectedBoard ? 'text-[#2383e2]' : 'group-hover:scale-110 transition-transform'} />
                <span className="text-sm font-semibold">Dashboard</span>
              </button>
              <div className="w-full h-px bg-white/5 my-4" />
            </div>

            {/* Boards Section */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2 pb-2 group/title">
                <p className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Seus Quadros</p>
                <button onClick={() => setShowCreateModal(true)} className="opacity-0 group-hover/title:opacity-100 hover:text-white text-white/20 transition-all">
                  <PlusCircle size={14} />
                </button>
              </div>

              <div className="space-y-0.5">
                {boards.map(board => (
                  <button
                    key={board.id}
                    onClick={() => setSelectedBoard(board)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group ${selectedBoard?.id === board.id ? 'bg-white/5 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)] font-bold' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                  >
                    <div className={`w-2 h-2 rounded-full transition-all ${selectedBoard?.id === board.id ? 'bg-[#2383e2] scale-125' : 'bg-white/10 group-hover:bg-white/30'}`} />
                    <span className="text-[13px] truncate">{board.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </nav>

          {/* User Footer */}
          <div className="p-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 group relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#373737] to-[#202020] border border-white/10 flex items-center justify-center text-white text-xs font-black shadow-inner">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.email?.split('@')[0]}</p>
                <p className="text-[9px] text-white/30 font-bold tracking-tighter uppercase truncate">{user.email}</p>
              </div>
              <button
                onClick={() => useAuthStore.getState().signOut()}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-red-400 transition-all"
                title="Sair"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
          {/* Mobile Close Button Bottom */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden mt-auto mx-4 mb-8 py-3 bg-[#2383e2] text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-[#2383e2]/20 active:scale-95 transition-all"
          >
            Voltar para o Projeto
          </button>
        </div>

        {/* Handle for Collapse (Desktop Only) */}
        <div
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`absolute top-0 right-0 w-1 h-full cursor-pointer group/handle z-50 hover:bg-[#2383e2]/40 transition-colors hidden lg:block`}
        >
          <button
            className={`absolute top-12 -right-3 w-6 h-6 bg-[#121212] border border-white/10 rounded-full flex items-center justify-center shadow-xl transition-all opacity-0 group-hover/sidebar:opacity-100 hover:scale-110 active:scale-95 ${isSidebarCollapsed ? 'rotate-180 opacity-100' : ''}`}
          >
            <ChevronRight size={12} className="text-[#8b8b8b]" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#191919]">
        {/* Header - Notion Style */}
        <header className="h-12 border-b border-[#2f2f2f] px-4 flex items-center justify-between sticky top-0 bg-[#191919]/90 backdrop-blur-md z-30 shrink-0">
          <div className="flex items-center gap-2 text-sm overflow-hidden truncate">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1.5 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] transition-colors"
            >
              <Menu size={18} />
            </button>
            {isSidebarCollapsed && (
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                className="hidden lg:block p-1.5 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] transition-colors"
              >
                <LayoutDashboard size={16} />
              </button>
            )}
            <div className="flex items-center gap-2 text-[#8b8b8b] text-[13px]">
              <span className="hover:text-white cursor-pointer transition-colors" onClick={() => setSelectedBoard(null)}>Dashboard</span>
              {selectedBoard && (
                <>
                  <span className="opacity-30">/</span>
                  <div className="flex items-center gap-1.5 text-white font-medium">
                    <Hash size={14} className="opacity-50" />
                    <span>{selectedBoard.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {selectedBoard && (
              <button
                onClick={() => setShowShareModal(true)}
                className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-[#2383e2] hover:bg-[#1a5fb4] text-white text-[10px] md:text-[11px] font-bold rounded-lg transition-all flex items-center gap-1.5 md:gap-2 shadow-lg shadow-[#2383e2]/10"
              >
                <Share2 size={12} className="md:w-3.5 md:h-3.5" />
                <span className="hidden xs:inline">Compartilhar</span>
                <span className="xs:hidden">Link</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          {selectedBoard ? (
            <BoardViewPage board={selectedBoard} onBack={() => setSelectedBoard(null)} />
          ) : (
            <div className="flex flex-col h-full bg-[#121212] overflow-y-auto custom-scrollbar p-8 lg:p-12">
              <div className="max-w-7xl mx-auto w-full space-y-12">
                {/* Hero Dashboard */}
                <div className="relative p-10 rounded-2xl bg-[#1c1c1c] border border-white/5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#2383e2]/5 blur-[100px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Projetos</h1>
                      <p className="text-sm text-white/40 font-medium max-w-md">
                        Gerenciamento de fluxo de trabalho com foco e simplicidade.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-3 bg-white text-black hover:bg-white/90 rounded-xl font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shrink-0"
                    >
                      <PlusCircle size={16} />
                      NOVO QUADRO
                    </button>
                  </div>
                </div>

                {/* Boards Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-6 bg-[#2383e2] rounded-full" />
                      <h3 className="text-xl font-bold text-white">Espaço de Trabalho</h3>
                    </div>
                    <span className="text-sm font-bold text-white/20 uppercase tracking-widest leading-none">{boards.length} Boards</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {boards.map((board, idx) => (
                      <div
                        key={board.id}
                        onClick={() => setSelectedBoard(board)}
                        className="group relative bg-[#1c1c1c] border border-white/5 rounded-2xl p-6 cursor-pointer transition-all hover:border-white/10 hover:bg-[#202020] animate-in fade-in slide-in-from-bottom-2 duration-500"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40 transition-colors group-hover:text-[#2383e2]">
                            <Hash size={20} />
                          </div>
                          <ChevronRight size={18} className="text-white/10 group-hover:text-white/30 transition-colors" />
                        </div>

                        <h4 className="text-lg font-bold text-white mb-1">{board.name}</h4>
                        <p className="text-[11px] text-white/20 font-bold uppercase tracking-wider mb-6">Criado em {new Date(board.created_at).toLocaleDateString('pt-BR')}</p>

                        <div className="flex items-center -space-x-1.5 opacity-40">
                          <div className="w-6 h-6 rounded-lg bg-[#2383e2] border-2 border-[#1c1c1c] flex items-center justify-center text-[8px] font-black text-white">U</div>
                          <div className="w-6 h-6 rounded-lg bg-[#2c2c2c] border-2 border-[#1c1c1c] flex items-center justify-center text-[8px] font-black text-white/40">+</div>
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
        <CreateBoardModal onClose={() => setShowCreateModal(false)} />
      )}
      {showShareModal && selectedBoard && (
        <ShareBoardModal board={selectedBoard} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  )
}

export default App
