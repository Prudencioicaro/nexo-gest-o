import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                // Artificial delay to show the NEXO loader
                await new Promise(resolve => setTimeout(resolve, 3000))
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                        },
                    },
                })
                if (error) throw error
                alert('Cadastro realizado! Verifique seu email ou tente fazer login.')
                setIsLogin(true)
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro na autenticação')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
            {/* 3D Rotating Void Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg_at_50%_50%,#000000_0%,#1a1a1a_40%,#000000_60%,#1a1a1a_90%,#000000_100%)] opacity-40 animate-[spin_60s_linear_infinite]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_80%)]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay" />
            </div>

            {/* Floating Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2383e2]/20 blur-[120px] rounded-full animate-pulse pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full animate-pulse delay-1000 pointer-events-none mix-blend-screen" />

            {loading && (
                <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#121212] animate-in fade-in duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#2383e2]/10 blur-[120px] rounded-full animate-pulse" />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <div className="relative">
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
                                Autenticando...
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
            )}

            <div className="glass-panel w-full max-w-[400px] p-8 md:p-10 shadow-2xl relative z-10 backdrop-blur-2xl bg-black/40 border border-white/10 rounded-3xl animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-6">
                        <img src="/logo.png" alt="NEXO" className="h-20 w-auto brightness-200" />
                    </div>
                    <p className="text-muted-foreground mt-2">
                        {isLogin ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    {!isLogin && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <input
                                type="text"
                                className="w-full bg-secondary border border-border p-2 rounded-md focus:ring-2 focus:ring-primary outline-none"
                                placeholder="Seu nome"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full bg-secondary border border-border p-2 rounded-md focus:ring-2 focus:ring-primary outline-none"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Senha</label>
                        <input
                            type="password"
                            className="w-full bg-secondary border border-border p-2 rounded-md focus:ring-2 focus:ring-primary outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="text-destructive text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-2 font-bold mt-4"
                    >
                        {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Cadastrar'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
                    </button>
                </div>
            </div>
        </div>
    )
}
