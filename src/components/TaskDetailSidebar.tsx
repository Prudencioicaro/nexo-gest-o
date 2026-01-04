import { useState, useRef, useEffect } from 'react'
import { X, Trash2, Type, AlignLeft, CheckSquare, Plus, List, Check, Paperclip, FileIcon, ExternalLink, Loader2, Users, Calendar, Hash } from 'lucide-react'
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

    const formatNumber = (value: any, format?: string) => {
        if (value === undefined || value === '') return ''
        const num = parseFloat(value)
        if (isNaN(num)) return value

        switch (format) {
            case 'currency_brl':
                return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
            case 'currency_usd':
                return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
            case 'decimal':
                return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)
            default:
                return value
        }
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
            {/* Backdrop for explicit focus */}
            <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-[100]" onClick={onClose} />

            <div className="fixed top-0 right-0 h-full w-full md:w-[600px] bg-[#202020] border-l border-[#2f2f2f] shadow-2xl z-[110] flex flex-col animate-in slide-in-from-right duration-300 ease-out">
                {/* Header */}
                <div className="flex items-center justify-between p-4 bg-[#202020] sticky top-0 z-20">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-1.5 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => { if (confirm('Excluir esta tarefa?')) { deleteTask(taskId); onClose(); } }} className="p-1.5 hover:bg-red-400/10 rounded text-[#8b8b8b] hover:text-red-400 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 custom-scrollbar space-y-12">
                    {/* Title */}
                    <div className="space-y-4">
                        <textarea
                            className="w-full bg-transparent border-none outline-none text-2xl md:text-4xl font-bold text-white resize-none h-auto placeholder:text-white/20"
                            value={task.data_json?.[columns[0]?.id] || ''}
                            onChange={(e) => handleUpdate(columns[0]?.id, e.target.value)}
                            placeholder="Sem título"
                            rows={1}
                        />
                    </div>

                    {/* Properties Mesh */}
                    <div className="grid grid-cols-1 gap-y-4">
                        {columns.slice(1).map(col => (
                            <div key={col.id} className="grid grid-cols-[140px,1fr] items-center group">
                                <div className="flex items-center gap-2 text-[#8b8b8b] text-[10px] md:text-[11px] font-bold uppercase tracking-wider">
                                    <span className="opacity-50">{getColIcon(col.type)}</span>
                                    <span>{col.name}</span>
                                </div>
                                <div className="min-h-[32px] flex items-center px-2 rounded hover:bg-[#2c2c2c]/50 transition-colors">
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
                                            className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${task.data_json?.[col.id] ? 'bg-[#2383e2] border-[#2383e2]' : 'border-[#2f2f2f] hover:border-[#8b8b8b]'}`}
                                        >
                                            {task.data_json?.[col.id] && <Check size={12} className="text-white" />}
                                        </button>
                                    ) : col.type === 'person' ? (
                                        <select
                                            className="bg-transparent border-none outline-none w-full text-xs text-white appearance-none cursor-pointer"
                                            value={task.data_json?.[col.id] || ''}
                                            onChange={(e) => handleUpdate(col.id, e.target.value)}
                                        >
                                            <option value="" className="bg-[#191919]">Ninguém</option>
                                            {members.map((m: any) => (
                                                <option key={m.id} value={m.profiles?.email} className="bg-[#191919]">{m.profiles?.email}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="relative w-full group/field">
                                            <input
                                                className="bg-transparent border-none outline-none w-full text-xs text-white absolute inset-0 z-10 opacity-0 focus:opacity-100"
                                                value={task.data_json?.[col.id] || ''}
                                                onChange={(e) => handleUpdate(col.id, e.target.value)}
                                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                            />
                                            <div className="text-xs text-white pointer-events-none group-focus-within/field:hidden">
                                                {col.type === 'number'
                                                    ? formatNumber(task.data_json?.[col.id], col.options?.numberFormat) || <span className="text-[#3c3c3c]">Vazio</span>
                                                    : task.data_json?.[col.id] || <span className="text-[#3c3c3c]">Vazio</span>
                                                }
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="h-px bg-[#2f2f2f]" />

                    {/* Attachments Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#8b8b8b] text-[11px] font-bold uppercase tracking-wider">
                                <Paperclip size={14} className="opacity-50" />
                                <span>Anexos</span>
                            </div>
                            <label className="cursor-pointer bg-[#2c2c2c] hover:bg-[#373737] px-2 py-1 rounded text-[10px] font-bold text-white transition-all">
                                ADICIONAR
                                <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                            </label>
                        </div>

                        {isUploading && (
                            <div className="flex items-center gap-2 text-xs text-[#8b8b8b] bg-[#2c2c2c]/30 p-3 rounded-lg border border-dashed border-[#2f2f2f]">
                                <Loader2 size={14} className="animate-spin text-[#2383e2]" />
                                <span>Enviando arquivo...</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            {task.data_json?.attachments?.map((file: any) => (
                                <div key={file.id} className="group relative bg-[#2c2c2c]/40 border border-[#2f2f2f] rounded-lg overflow-hidden hover:border-[#373737] transition-all">
                                    {isImage(file.url) ? (
                                        <div className="h-24 bg-[#191919] flex items-center justify-center overflow-hidden">
                                            <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                        </div>
                                    ) : (
                                        <div className="h-24 bg-[#191919] flex items-center justify-center">
                                            <FileIcon size={32} className="text-[#3c3c3c]" />
                                        </div>
                                    )}
                                    <div className="p-2 flex items-center justify-between gap-2 overflow-hidden">
                                        <span className="text-[10px] text-white truncate font-medium">{file.name}</span>
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-[#8b8b8b] hover:text-white shrink-0">
                                            <ExternalLink size={12} />
                                        </a>
                                    </div>
                                    <button
                                        onClick={() => handleUpdate('attachments', task.data_json?.attachments.filter((a: any) => a.id !== file.id))}
                                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-md text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={10} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-[#2f2f2f]" />

                    {/* Checklist Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#8b8b8b] text-[11px] font-bold uppercase tracking-wider">
                                <CheckSquare size={14} className="opacity-50" />
                                <span>Checklist</span>
                            </div>
                            <div className="text-[10px] font-bold text-[#8b8b8b]">
                                {task.data_json?.checklist?.length > 0
                                    ? Math.round((task.data_json.checklist.filter((i: any) => i.completed).length / task.data_json.checklist.length) * 100)
                                    : 0}%
                            </div>
                        </div>

                        <div className="h-1.5 w-full bg-[#191919] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#529e72] transition-all duration-700 ease-out"
                                style={{ width: `${task.data_json?.checklist?.length > 0 ? (task.data_json.checklist.filter((i: any) => i.completed).length / task.data_json.checklist.length) * 100 : 0}%` }}
                            />
                        </div>

                        <div className="space-y-3">
                            {task.data_json?.checklist?.map((item: any) => (
                                <div key={item.id} className="flex items-center gap-3 group/item">
                                    <button
                                        onClick={() => {
                                            const newList = task.data_json.checklist.map((i: any) =>
                                                i.id === item.id ? { ...i, completed: !i.completed } : i
                                            )
                                            handleUpdate('checklist', newList)
                                        }}
                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${item.completed ? 'bg-[#529e72] border-[#529e72]' : 'border-[#2f2f2f] hover:border-[#8b8b8b]'}`}
                                    >
                                        {item.completed && <Check size={12} className="text-white" />}
                                    </button>
                                    <input
                                        ref={(el) => { checklistInputRefs.current[item.id] = el }}
                                        className={`flex-1 bg-transparent border-none outline-none text-sm transition-all ${item.completed ? 'text-[#3c3c3c] line-through font-medium' : 'text-white'}`}
                                        value={item.text}
                                        onChange={(e) => {
                                            const newList = task.data_json.checklist.map((i: any) =>
                                                i.id === item.id ? { ...i, text: e.target.value } : i
                                            )
                                            handleUpdate('checklist', newList)
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.currentTarget.blur()
                                            }
                                        }}
                                        placeholder="Novo item..."
                                    />
                                    <button
                                        onClick={() => {
                                            const newList = task.data_json.checklist.filter((i: any) => i.id !== item.id)
                                            handleUpdate('checklist', newList)
                                        }}
                                        className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-red-400/10 rounded text-[#8b8b8b] hover:text-red-400 transition-all"
                                    >
                                        <X size={14} />
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
                                className="flex items-center gap-2 text-[#8b8b8b] hover:text-white text-xs transition-colors py-2 px-1 group/add rounded-lg hover:bg-[#2c2c2c]/30"
                            >
                                <Plus size={14} className="group-hover/add:scale-110 transition-transform" />
                                <span>Adicionar item</span>
                            </button>
                        </div>
                    </div>

                    <div className="h-px bg-[#2f2f2f]" />

                    {/* Description Area */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[#8b8b8b] text-[11px] font-bold uppercase tracking-wider">
                            <AlignLeft size={14} className="opacity-50" />
                            <span>Descrição / Comentários</span>
                        </div>
                        <textarea
                            className="w-full bg-[#191919] border border-[#2f2f2f] rounded-xl p-4 text-sm text-white outline-none min-h-[200px] hover:border-[#373737] focus:border-[#2383e2] transition-all placeholder:text-[#3c3c3c]"
                            placeholder="Adicione notas detalhadas aqui..."
                            value={task.data_json?.description || ''}
                            onChange={(e) => handleUpdate('description', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </>
    )
}
