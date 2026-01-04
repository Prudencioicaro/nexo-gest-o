import { useState } from 'react'
import { motion } from 'framer-motion'
import { GripVertical, CheckCircle2, Circle } from 'lucide-react'

// Mock Data for Demo
const initialTasks = [
    { id: '1', title: 'Lançar MVP do Nexo', status: 'done' },
    { id: '2', title: 'Otimizar Performance', status: 'doing' },
    { id: '3', title: 'Criar Landing Page', status: 'todo' },
]

export function InteractiveDemo() {
    const [tasks, setTasks] = useState(initialTasks)

    const moveTask = (taskId: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="px-3 py-1 rounded-full bg-[#2383e2]/10 border border-[#2383e2]/30 text-[#2383e2] text-xs font-bold uppercase tracking-widest">
                    Live Demo
                </div>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* DOING */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Circle size={12} className="text-yellow-500" />
                        Em Progresso
                    </h3>
                    <div className="space-y-3 min-h-[100px] bg-white/5 rounded-2xl p-4 border border-white/5">
                        {tasks.filter(t => t.status === 'doing').map(task => (
                            <motion.div
                                layoutId={task.id}
                                key={task.id}
                                className="bg-[#202020] p-4 rounded-xl border border-white/10 shadow-lg cursor-grab active:cursor-grabbing group/card hover:border-[#2383e2]/50 transition-colors"
                                onClick={() => moveTask(task.id, 'done')}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-white">{task.title}</span>
                                    <GripVertical size={14} className="text-white/20" />
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold">Alta Prioridade</span>
                                </div>
                            </motion.div>
                        ))}
                        {tasks.filter(t => t.status === 'doing').length === 0 && (
                            <div className="h-24 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center text-white/20 text-xs">
                                Arraste aqui
                            </div>
                        )}
                    </div>
                </div>

                {/* TODO */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Circle size={12} className="text-gray-500" />
                        Para Fazer
                    </h3>
                    <div className="space-y-3 min-h-[100px] bg-white/5 rounded-2xl p-4 border border-white/5">
                        {tasks.filter(t => t.status === 'todo').map(task => (
                            <motion.div
                                layoutId={task.id}
                                key={task.id}
                                className="bg-[#202020] p-4 rounded-xl border border-white/10 shadow-lg cursor-grab active:cursor-grabbing group/card hover:border-[#2383e2]/50 transition-colors"
                                onClick={() => moveTask(task.id, 'doing')}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-white">{task.title}</span>
                                    <GripVertical size={14} className="text-white/20" />
                                </div>
                                <div className="mt-3 flex gap-2">
                                    <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded font-bold">Backlog</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* DONE */}
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-500" />
                        Concluído
                    </h3>
                    <div className="space-y-3 min-h-[100px] bg-white/5 rounded-2xl p-4 border border-white/5">
                        {tasks.filter(t => t.status === 'done').map(task => (
                            <motion.div
                                layoutId={task.id}
                                key={task.id}
                                className="bg-[#202020] p-4 rounded-xl border border-green-500/30 shadow-lg cursor-grab active:cursor-grabbing group/card"
                                onClick={() => moveTask(task.id, 'todo')}
                            >
                                <div className="flex justify-between items-start">
                                    <span className="text-sm font-medium text-white/60 line-through decoration-white/30">{task.title}</span>
                                    <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                        <CheckCircle2 size={10} className="text-[#121212]" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 right-6 text-[10px] text-white/20 font-mono">
                * Clique nos cards para mover
            </div>
        </div>
    )
}
