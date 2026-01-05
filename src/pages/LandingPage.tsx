import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2, Layout, Smartphone, Zap } from 'lucide-react'
import { InteractiveDemo } from '../components/landing/InteractiveDemo'

interface LandingPageProps {
    onAuth: () => void
}

export function LandingPage({ onAuth }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#0b0c0e] text-[#e3e3e3] selection:bg-[#4285F4]/30 selection:text-white overflow-x-hidden">

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-[#0b0c0e]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Nexo" className="h-7 w-auto brightness-200" />
                        <span className="font-semibold text-lg tracking-tight text-white/90">Nexo</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onAuth}
                            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
                        >
                            Entrar
                        </button>
                        <button
                            onClick={onAuth}
                            className="bg-[#4285F4] hover:bg-[#1a73e8] text-white px-5 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
                        >
                            Começar agora
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-24 px-6 overflow-hidden">
                {/* Subtle Gemini Glows */}
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#4285F4]/10 blur-[120px] rounded-full pointer-events-none opacity-40" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#9B72CB]/10 blur-[100px] rounded-full pointer-events-none opacity-30" />

                <div className="relative z-10 max-w-[1000px] mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm"
                    >
                        <Zap size={14} className="text-[#4285F4]" fill="currentColor" />
                        <span className="text-sm font-medium text-white/80">Nova versão 1.0 disponível</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[1.1]"
                    >
                        Coloque ordem <br />
                        <span className="text-gradient-gemini">no caos.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-xl md:text-2xl text-[#9aa0a6] mb-12 leading-relaxed max-w-2xl mx-auto font-light"
                    >
                        A plataforma inteligente para quem constrói o futuro.
                        Projetos, tarefas e docs em um único lugar.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
                    >
                        <button
                            onClick={onAuth}
                            className="group relative inline-flex items-center gap-2 px-8 py-4 bg-[#4285F4] hover:bg-[#1a73e8] rounded-full text-white font-medium text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            Começar Gratuitamente
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={onAuth}
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-medium text-lg transition-all backdrop-blur-sm"
                        >
                            Ver demonstração
                        </button>
                    </motion.div>

                    {/* Interactive Demo Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="glass-panel p-2 shadow-2xl"
                    >
                        <InteractiveDemo />
                    </motion.div>
                </div>
            </section>

            {/* Features / Showcase Section */}
            <section className="py-32 px-6">
                <div className="max-w-[1200px] mx-auto space-y-40">

                    {/* Feature 1: The Dashboard */}
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="order-2 md:order-1 relative group">
                            {/* Subtle Glow behind image */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#4285F4]/20 to-purple-500/20 blur-[80px] rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-700" />

                            <div className="glass-panel p-2 transition-transform duration-700 group-hover:scale-[1.01]">
                                <img
                                    src="/assets/landing/dashboard.png"
                                    alt="Dashboard Interface"
                                    className="relative rounded-[1.25rem] shadow-lg"
                                />
                            </div>
                        </div>
                        <div className="order-1 md:order-2 space-y-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#4285F4]/10 flex items-center justify-center">
                                <Layout className="text-[#4285F4]" size={28} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Painel Unificado</h2>
                            <p className="text-[#9aa0a6] text-xl leading-relaxed">
                                Diga adeus à alternância de abas. Visualize seu progresso macro e micro em uma interface desenhada para clareza absoluta.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {['Visualização Kanban Avançada', 'Filtros Inteligentes em Tempo Real', 'Interface Limpa e Focada'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-white/80 text-lg">
                                        <CheckCircle2 size={20} className="text-[#4285F4]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Mobile Experience */}
                    <div className="grid md:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#9B72CB]/10 flex items-center justify-center">
                                <Smartphone className="text-[#9B72CB]" size={28} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Mobile First</h2>
                            <p className="text-[#9aa0a6] text-xl leading-relaxed">
                                Leve seu escritório no bolso. Nossa experiência mobile não é apenas responsiva, é nativa, fluida e desenvolvida para gestos.
                            </p>
                            <ul className="space-y-4 pt-4">
                                {['Modo Escuro Nativo', 'Gestos de Swipe Naturais', 'Sincronização Instantânea'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-white/80 text-lg">
                                        <CheckCircle2 size={20} className="text-[#9B72CB]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group flex justify-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[500px] bg-[#9B72CB]/20 blur-[100px] rounded-full pointer-events-none" />
                            <div className="relative z-10 glass-panel p-2 rounded-[2.5rem] transform transition-transform duration-700 hover:rotate-1">
                                <img
                                    src="/assets/landing/mobile.png"
                                    alt="Mobile Interface"
                                    className="h-[600px] w-auto rounded-[2rem] shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* CTA Final */}
            <section className="py-32 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto text-center relative z-10 glass-panel p-16 md:p-24 bg-gradient-to-br from-[#1e1e20] to-[#0b0c0e]">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Construa com <span className="text-gradient-gemini">Nexo</span></h2>
                    <p className="text-xl text-[#9aa0a6] mb-12 max-w-2xl mx-auto">
                        Junte-se à comunidade de criadores que escolheram a simplicidade.
                    </p>
                    <button
                        onClick={onAuth}
                        className="px-10 py-4 bg-[#e3e3e3] text-black rounded-full font-bold text-lg hover:bg-white transition-all active:scale-95 shadow-xl"
                    >
                        Criar Conta Gratuita
                    </button>
                    <p className="mt-8 text-sm text-white/40">Não é necessário cartão de crédito.</p>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 bg-[#0b0c0e]">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-all">
                        <img src="/logo.png" alt="Nexo" className="h-6 w-auto brightness-200" />
                        <span className="font-semibold text-white/90">Nexo</span>
                    </div>
                    <div className="flex gap-8 text-sm text-[#9aa0a6]">
                        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-white transition-colors">Termos</a>
                        <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    </div>
                    <div className="text-[#5f6368] text-sm">
                        © 2026 Nexo Inc.
                    </div>
                </div>
            </footer>
        </div>
    )
}
