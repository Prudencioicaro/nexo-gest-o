import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Layout, Smartphone } from 'lucide-react'
import { InteractiveDemo } from '../components/landing/InteractiveDemo'

interface LandingPageProps {
    onAuth: () => void
}

export function LandingPage({ onAuth }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#2383e2]/30 selection:text-white overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Nexo" className="h-8 w-auto brightness-200" />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onAuth}
                            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={onAuth}
                            className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                        >
                            Criar Conta
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[#2383e2]/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 max-w-[1200px] mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-[#2383e2] animate-pulse" />
                            <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Nexo v1.0 Disponível</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent"
                        >
                            Coloque ordem no caos.
                            <br />
                            Conecte suas ideias.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-lg md:text-xl text-white/40 mb-10 leading-relaxed max-w-2xl mx-auto"
                        >
                            A plataforma definitiva para gerenciar projetos, tarefas e conhecimento. Design premium, performance nativa e experiência fluida.
                        </motion.p>

                        <motion.button
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            onClick={onAuth}
                            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#2383e2] rounded-full text-white font-bold text-lg overflow-hidden transition-transform active:scale-95"
                        >
                            <span className="relative z-10">Começar Gratuitamente</span>
                            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#2383e2] to-[#1a5eb4] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </motion.button>
                    </div>

                    {/* Interactive Demo */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <InteractiveDemo />
                    </motion.div>
                </div>
            </section>

            {/* Features / Showcase Section */}
            <section className="py-32 px-6 bg-[#0a0a0a]">
                <div className="max-w-[1200px] mx-auto space-y-32">

                    {/* Feature 1: The Dashboard */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="order-2 md:order-1 relative group">
                            <div className="absolute -inset-4 bg-gradient-to-r from-[#2383e2]/20 to-purple-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <img
                                src="/assets/landing/dashboard.png"
                                alt="Dashboard Interface"
                                className="relative rounded-2xl border border-white/10 shadow-2xl z-10 transform transition-transform duration-700 hover:scale-[1.02] hover:-rotate-1"
                            />
                        </div>
                        <div className="order-1 md:order-2 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Layout className="text-[#2383e2]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">Painel de Controle Unificado</h2>
                            <p className="text-white/40 text-lg leading-relaxed">
                                Tudo o que você precisa em uma única tela. Visualize seus projetos com clareza usando quadros Kanban, calendários e listas inteligentes. O Nexo se adapta ao seu fluxo de trabalho, não o contrário.
                            </p>
                            <ul className="space-y-3">
                                {['Visualização Kanban Avançada', 'Filtros Inteligentes', 'Drag & Drop Fluido'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-white/60">
                                        <CheckCircle2 size={16} className="text-[#2383e2]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Mobile Experience */}
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Smartphone className="text-[#2383e2]" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold">Poder na Palma da Mão</h2>
                            <p className="text-white/40 text-lg leading-relaxed">
                                Uma experiência mobile de verdade, não apenas responsiva. O Nexo foi desenhado pixel a pixel para funcionar perfeitamente no seu celular, com gestos naturais e carregamento instantâneo.
                            </p>
                            <ul className="space-y-3">
                                {['Modo Escuro Nativo', 'Gestos de Swipe', 'Sincronização em Tempo Real'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-white/60">
                                        <CheckCircle2 size={16} className="text-[#2383e2]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group flex justify-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-[#2383e2]/20 blur-[100px] rounded-full pointer-events-none" />
                            <img
                                src="/assets/landing/mobile.png"
                                alt="Mobile Interface"
                                className="relative h-[600px] w-auto drop-shadow-2xl z-10 transform transition-transform duration-700 hover:scale-105"
                            />
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#2383e2]/5" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Pronto para elevar sua produtividade?</h2>
                    <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto">
                        Junte-se a milhares de usuários que já organizaram suas vidas com o Nexo.
                    </p>
                    <button
                        onClick={onAuth}
                        className="px-12 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        Criar Conta Gratuita
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-[#0a0a0a]">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
                        <img src="/logo.png" alt="Nexo" className="h-6 w-auto brightness-200" />
                        <span className="font-bold text-white/80">NEXO</span>
                    </div>
                    <div className="text-white/20 text-sm">
                        © 2026 Nexo Inc. Todos os direitos reservados.
                    </div>
                </div>
            </footer>
        </div>
    )
}
