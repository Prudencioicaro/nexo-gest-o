import { useState, useRef, useEffect } from 'react'
import { X, Trash2, Type, AlignLeft, CheckSquare, Plus, List, Check, Paperclip, FileIcon, ExternalLink, Loader2, Users, Calendar, Hash, ChevronRight } from 'lucide-react'
import { StatusSelect } from './StatusSelect'
import { useBoardDetailStore } from '../store/useBoardDetailStore'
import type { BoardColumn } from '../types'

interface TaskDetailSidebarProps {
    taskId: string
    columns: BoardColumn[]
    onClose: () => void
}

export function TaskDetailSidebar({ taskId, columns, onClose }: TaskDetailSidebarProps) {
    const tasks = useBoardDetailStore(state => state.tasks)
    const members = useBoardDetailStore(state => state.members)
    const updateTask = useBoardDetailStore(state => state.updateTask)
    const updateColumn = useBoardDetailStore(state => state.updateColumn)
    const deleteTask = useBoardDetailStore(state => state.deleteTask)
    const uploadFile = useBoardDetailStore(state => state.uploadFile)

    const task = tasks.find(t => t.id === taskId)
    const [isUploading, setIsUploading] = useState(false)
    const [pendingFocusId, setPendingFocusId] = useState<string | null>(null)
    const checklistInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    useEffect(() => {
        if (pendingFocusId && checklistInputRefs.current[pendingFocusId]) {
            checklistInputRefs.current[pendingFocusId]?.focus()
            setPendingFocusId(null)
        }
    }, [pendingFocusId])

    if (!task) return null

    const handleUpdate = (colId: string, value: any) => {
        updateTask(taskId, { [colId]: value })
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setIsUploading(true)
        const url = await uploadFile(file)
        if (url) {
            const currentAttachments = task.data_json?.attachments || []
            handleUpdate('attachments', [...currentAttachments, {
                id: crypto.randomUUID(),
                name: file.name,
                url,
                type: file.type,
                size: file.size,
                createdAt: new Date().toISOString()
            }])
        }
        setIsUploading(false)
    }

    const getColIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type size={14} />
            case 'status': return <List size={14} />
            case 'date': return <Calendar size={14} />
            case 'number': return <Hash size={14} />
            case 'boolean': return <CheckSquare size={14} />
            case 'person': return <Users size={14} />
            default: return <Type size={14} />
        }
    }

    const isImage = (url: string) => /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url.toLowerCase())

    return (
        <>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-500" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full w-full md:w-[680px] bg-[#09090b] border-l border-white/[0.05] shadow-luxury z-[110] flex flex-col animate-in slide-in-from-right duration-500 ease-luxury">
                {/* Header */}
                <div className="flex items-center justify-between p-6 h-20 shrink-0 border-b border-white/[0.03]">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-luxury">
                            <X size={20} />
                        </button>
                        <div className="flex items-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-[2px]">
                            <span>Projeto</span>
                            <ChevronRight size={10} />
                            <span className="text-primary truncate max-w-[150px]">{task.data_json?.[columns[0]?.id] || 'Detalhes'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => { if (confirm('Remover este item?')) { deleteTask(taskId); onClose(); } }} className="p-2.5 hover:bg-red-500/10 rounded-xl text-white/20 hover:text-red-400 transition-luxury">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 md:px-14 py-10 no-scrollbar space-y-16">
                    {/* Title Area */}
                    <div className="space-y-2">
                        <textarea
                            className="w-full bg-transparent border-none outline-none text-3xl md:text-5xl font-semibold text-white tracking-tight resize-none h-auto placeholder:text-white/5 leading-tight"
                            value={task.data_json?.[columns[0]?.id] || ''}
                            onChange={(e) => handleUpdate(columns[0]?.id, e.target.value)}
                            placeholder="Sem título"
                            rows={1}
                        />
                    </div>

                    {/* Properties Section */}
                    <div className="space-y-3">
                        {columns.slice(1).map(col => (
                            <div key={col.id} className="grid grid-cols-[160px,1fr] items-center py-1 group/prop">
                                <div className="flex items-center gap-3 text-white/20 text-[11px] font-semibold tracking-wide">
                                    <span className="opacity-40 group-hover/prop:opacity-100 group-hover/prop:text-primary transition-luxury">{getColIcon(col.type)}</span>
                                    <span>{col.name}</span>
                                </div>
                                <div className="min-h-[36px] flex items-center px-3 rounded-xl hover:bg-white/[0.02] transition-luxury group/val">
                                    {col.type === 'status' ? (
                                        <StatusSelect
                                            value={task.data_json?.[col.id]}
                                            options={col.options?.options || []}
                                            onChange={(val) => handleUpdate(col.id, val)}
                                            onUpdateOptions={(opts) => updateColumn(col.id, { options: { ...col.options, options: opts } })}
                                        />
                                    ) : col.type === 'boolean' ? (
                                        <button
                                            onClick={() => handleUpdate(col.id, !task.data_json?.[col.id])}
                                            className={`w-4 h-4 rounded-md border transition-luxury flex items-center justify-center ${task.data_json?.[col.id] ? 'bg-primary border-primary shadow-glow-primary' : 'border-white/10 hover:border-white/30'}`}
                                        >
                                            {task.data_json?.[col.id] && <Check size={10} className="text-white" />}
                                        </button>
                                    ) : col.type === 'person' ? (
                                        <select
                                            className="bg-transparent border-none outline-none w-full text-[13px] text-white/80 appearance-none cursor-pointer"
                                            value={task.data_json?.[col.id] || ''}
                                            onChange={(e) => handleUpdate(col.id, e.target.value)}
                                        >
                                            <option value="" className="bg-[#09090b]">Atribuir...</option>
                                            {members.map((m: any) => (
                                                <option key={m.id} value={m.profiles?.email} className="bg-[#09090b]">{m.profiles?.email}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="relative w-full group/field">
                                            <input
                                                className="bg-transparent border-none outline-none w-full text-[13px] text-white absolute inset-0 z-10 opacity-0 focus:opacity-100"
                                                value={task.data_json?.[col.id] || ''}
                                                onChange={(e) => handleUpdate(col.id, e.target.value)}
                                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                            />
                                            <div className="text-[13px] text-white/60 pointer-events-none group-focus-within/field:hidden truncate">
                                                {col.type === 'number'
                                                    ? task.data_json?.[col.id]?.toLocaleString('pt-BR') || <span className="text-white/5 font-normal italic">Adicionar valor...</span>
                                                    : task.data_json?.[col.id] || <span className="text-white/5 font-normal italic">Vazio</span>
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-12 pt-8">
                        {/* Attachments */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white/30 text-[11px] font-bold uppercase tracking-[2px]">
                                    <Paperclip size={14} className="opacity-40" />
                                    <span>Arquivos</span>
                                </div>
                                <label className="cursor-pointer bg-white/[0.03] hover:bg-white/[0.08] px-4 py-1.5 rounded-full border border-white/[0.05] text-[10px] font-bold text-white transition-luxury active:scale-95">
                                    ADICIONAR
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                                </label>
                            </div>

                            {isUploading && (
                                <div className="flex items-center gap-3 text-xs text-white/20 bg-white/[0.01] p-5 rounded-[20px] border border-dashed border-white/5">
                                    <Loader2 size={16} className="animate-spin text-primary" />
                                    <span>Otimizando arquivo para o banco de dados...</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {task.data_json?.attachments?.map((file: any) => (
                                    <div key={file.id} className="group relative bg-white/[0.02] border border-white/[0.05] rounded-[24px] overflow-hidden hover:border-white/[0.1] hover:bg-white/[0.04] transition-luxury">
                                        {isImage(file.url) ? (
                                            <div className="h-32 bg-background flex items-center justify-center overflow-hidden">
                                                <img src={file.url} alt={file.name} className="w-full h-full object-cover group-hover:scale-110 transition-luxury duration-700" />
                                            </div>
                                        ) : (
                                            <div className="h-32 bg-background flex items-center justify-center">
                                                <FileIcon size={32} className="text-white/10" />
                                            </div>
                                        )}
                                        <div className="p-4 flex items-center justify-between gap-3 bg-gradient-to-t from-black/40 to-transparent">
                                            <span className="text-[11px] text-white/80 truncate font-medium">{file.name}</span>
                                            <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg text-white/20 hover:text-white transition-luxury">
                                                <ExternalLink size={14} />
                                            </a>
                                        </div>
                                        <button
                                            onClick={() => handleUpdate('attachments', task.data_json?.attachments.filter((a: any) => a.id !== file.id))}
                                            className="absolute top-2 right-2 p-2 bg-black/60 backdrop-blur-md rounded-xl text-red-400 opacity-0 group-hover:opacity-100 transition-luxury"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Checklist */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-white/30 text-[11px] font-bold uppercase tracking-[2px]">
                                    <CheckSquare size={14} className="opacity-40" />
                                    <span>Checklist</span>
                                </div>
                                <div className="text-[11px] font-bold text-primary">
                                    {task.data_json?.checklist?.length > 0
                                        ? Math.round((task.data_json.checklist.filter((i: any) => i.completed).length / task.data_json.checklist.length) * 100)
                                        : 0}%
                                </div>
                            </div>

                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary shadow-glow-primary transition-all duration-1000 ease-in-out"
                                    style={{ width: `${task.data_json?.checklist?.length > 0 ? (task.data_json.checklist.filter((i: any) => i.completed).length / task.data_json.checklist.length) * 100 : 0}%` }}
                                />
                            </div>

                            <div className="space-y-2">
                                {task.data_json?.checklist?.map((item: any) => (
                                    <div key={item.id} className="flex items-center gap-4 group/item py-1">
                                        <button
                                            onClick={() => {
                                                const newList = task.data_json.checklist.map((i: any) =>
                                                    i.id === item.id ? { ...i, completed: !i.completed } : i
                                                )
                                                handleUpdate('checklist', newList)
                                            }}
                                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-luxury ${item.completed ? 'bg-green-500 border-green-500 shadow-glow-green' : 'border-white/10 hover:border-white/30'}`}
                                        >
                                            {item.completed && <Check size={10} className="text-white" />}
                                        </button>
                                        <input
                                            ref={(el) => { checklistInputRefs.current[item.id] = el }}
                                            className={`flex-1 bg-transparent border-none outline-none text-[13px] transition-luxury ${item.completed ? 'text-white/20 line-through' : 'text-white'}`}
                                            value={item.text}
                                            onChange={(e) => {
                                                const newList = task.data_json.checklist.map((i: any) =>
                                                    i.id === item.id ? { ...i, text: e.target.value } : i
                                                )
                                                handleUpdate('checklist', newList)
                                            }}
                                            placeholder="Novo item..."
                                        />
                                        <button
                                            onClick={() => {
                                                const newList = task.data_json.checklist.filter((i: any) => i.id !== item.id)
                                                handleUpdate('checklist', newList)
                                            }}
                                            className="opacity-0 group-hover/item:opacity-100 p-2 hover:bg-white/5 rounded-lg text-white/10 hover:text-red-400 transition-luxury"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const id = crypto.randomUUID()
                                        const newList = [...(task.data_json?.checklist || []), { id, text: '', completed: false }]
                                        handleUpdate('checklist', newList)
                                        setPendingFocusId(id)
                                    }}
                                    className="flex items-center gap-3 text-white/20 hover:text-white/60 text-[13px] font-medium transition-luxury py-3 px-2 group/add rounded-xl hover:bg-white/[0.02]"
                                >
                                    <Plus size={14} className="group-hover/add:scale-125 transition-luxury bg-white/5 p-0.5 rounded" />
                                    <span>Adicionar item</span>
                                </button>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3 text-white/30 text-[11px] font-bold uppercase tracking-[2px]">
                                <AlignLeft size={14} className="opacity-40" />
                                <span>Anotações Detalhadas</span>
                            </div>
                            <textarea
                                className="w-full bg-white/[0.015] border border-white/[0.05] rounded-[24px] p-6 text-[13px] text-white/80 outline-none min-h-[250px] hover:border-white/[0.1] focus:border-primary/40 focus:bg-white/[0.03] transition-luxury placeholder:text-white/5 leading-relaxed"
                                placeholder="Pressione enter para começar a detalhar seu fluxo de trabalho..."
                                value={task.data_json?.description || ''}
                                onChange={(e) => handleUpdate('description', e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
