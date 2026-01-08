import { useMemo, useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    TouchSensor,
    closestCorners,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task, BoardColumn } from '../types'
import { FileText, Plus, MoreHorizontal, ChevronRight, Hash } from 'lucide-react'

interface KanbanBoardProps {
    tasks: Task[]
    columns: BoardColumn[]
    onTaskUpdate: (taskId: string, data: Record<string, any>) => void
    onTaskClick: (task: Task) => void
    onCreateTask: (initialData?: Record<string, any>) => void
}

export function KanbanBoard({ tasks, columns, onTaskUpdate, onTaskClick, onCreateTask }: KanbanBoardProps) {
    const statusColumn = columns.find(c => c.type === 'status')
    const options = statusColumn?.options?.options || []

    const kanbanColumns = useMemo(() => {
        if (options.length === 0) {
            return [{ id: 'no-status', label: 'Sem Status', color: 'Default' }]
        }
        return options.map((opt: any) => ({
            id: opt.label,
            label: opt.label,
            color: opt.color
        }))
    }, [options])

    const [activeTask, setActiveTask] = useState<Task | null>(null)
    const [overColumnId, setOverColumnId] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event
        const task = tasks.find(t => t.id === active.id)
        if (task) setActiveTask(task)
    }

    const handleDragOver = (event: any) => {
        const { over } = event
        if (over) {
            const overId = over.id as string
            const isColumn = kanbanColumns.some((c: any) => c.id === overId)
            if (isColumn) {
                setOverColumnId(overId)
            } else {
                const overTask = tasks.find(t => t.id === overId)
                if (overTask && statusColumn) {
                    setOverColumnId(overTask.data_json?.[statusColumn.id] || 'no-status')
                }
            }
        } else {
            setOverColumnId(null)
        }
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setOverColumnId(null)
        if (!over) return

        const activeTaskId = active.id as string
        const overId = over.id as string

        const overColumn = kanbanColumns.find((col: any) => col.id === overId)
        const overTask = tasks.find(t => t.id === overId)

        let newStatus = ''
        if (overColumn) {
            newStatus = overColumn.id
        } else if (overTask && statusColumn) {
            newStatus = overTask.data_json?.[statusColumn.id] || ''
        }

        if (newStatus && statusColumn) {
            const task = tasks.find(t => t.id === activeTaskId)
            if (task && task.data_json?.[statusColumn.id] !== newStatus) {
                onTaskUpdate(activeTaskId, { ...task.data_json, [statusColumn.id]: newStatus === 'no-status' ? '' : newStatus })
            }
        }

        setActiveTask(null)
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-10 p-6 md:p-14 h-fit min-h-full items-start overflow-x-auto no-scrollbar bg-transparent">
                {kanbanColumns.map((col: any) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        label={col.label}
                        color={col.color}
                        tasks={tasks.filter(t => (t.data_json?.[statusColumn?.id || ''] || 'no-status') === (col.id === 'no-status' ? 'no-status' : col.id))}
                        onTaskClick={onTaskClick}
                        onCreateTask={(data) => onCreateTask({ [statusColumn?.id || 'status']: col.id === 'no-status' ? '' : col.id, ...data })}
                        columns={columns}
                        isOver={overColumnId === col.id}
                    />
                ))}
            </div>

            <DragOverlay dropAnimation={null}>
                {activeTask ? (
                    <div className="w-80 p-5 glass-surface rounded-2xl shadow-luxury rotate-[2deg] cursor-grabbing scale-105 transition-luxury">
                        <div className="flex items-center gap-2 mb-3">
                            <Hash size={12} className="text-primary" />
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Movendo</span>
                        </div>
                        <p className="text-[14px] font-medium text-white/90 leading-relaxed">{activeTask.data_json?.[columns[0]?.id] || 'Tarefa sem título'}</p>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

interface KanbanColumnProps {
    id: string
    label: string
    color: string
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onCreateTask: (initialData?: Record<string, any>) => void
    columns: BoardColumn[]
    isOver: boolean
}

function KanbanColumn({ id, label, color, tasks, onTaskClick, onCreateTask, columns, isOver }: KanbanColumnProps) {
    const { setNodeRef } = useSortable({ id })

    const NOTION_COLORS: Record<string, { bg: string, text: string }> = {
        'Default': { bg: 'rgba(255,255,255,0.05)', text: 'rgba(255,255,255,0.6)' },
        'Gray': { bg: 'rgba(255,255,255,0.1)', text: 'rgba(255,255,255,0.7)' },
        'Blue': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
        'Green': { bg: 'rgba(34,197,94,0.15)', text: '#4ade80' },
        'Yellow': { bg: 'rgba(234,179,8,0.15)', text: '#facc15' },
        'Orange': { bg: 'rgba(249,115,22,0.15)', text: '#fb923c' },
        'Red': { bg: 'rgba(239,68,68,0.15)', text: '#f87171' },
        'Purple': { bg: 'rgba(168,85,247,0.15)', text: '#c084fc' },
        'Pink': { bg: 'rgba(236,72,153,0.15)', text: '#f472b6' },
    }

    const colorStyles = NOTION_COLORS[color] || NOTION_COLORS['Default']

    return (
        <div ref={setNodeRef} className="w-80 shrink-0 flex flex-col gap-6 group/column transition-luxury">
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <span
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-tight border border-white/[0.03]"
                        style={{ backgroundColor: colorStyles.bg, color: colorStyles.text }}
                    >
                        {label}
                    </span>
                    <span className="text-[11px] font-bold text-white/20">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover/column:opacity-100 transition-luxury">
                    <button onClick={() => onCreateTask()} className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-luxury">
                        <Plus size={14} />
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-luxury">
                        <MoreHorizontal size={14} />
                    </button>
                </div>
            </div>

            <div className={`flex-1 space-y-3 min-h-[500px] transition-luxury rounded-2xl ${isOver ? 'bg-white/[0.02] shadow-inner' : ''}`}>
                {tasks.map((task, idx) => (
                    <SortableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                        columns={columns}
                        index={idx}
                    />
                ))}

                {isOver && (
                    <div className="w-full h-24 bg-white/[0.01] border border-dashed border-white/5 rounded-[20px] animate-pulse" />
                )}

                <button
                    onClick={() => onCreateTask()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white/10 hover:text-white/40 hover:bg-white/[0.02] rounded-xl transition-luxury text-[13px] font-medium group/btn"
                >
                    <Plus size={14} className="group-hover/btn:scale-125 transition-luxury" />
                    <span>Adicionar item</span>
                </button>
            </div>
        </div>
    )
}

function SortableTaskCard({ task, onClick, columns, index }: { task: Task; onClick: () => void; columns: BoardColumn[]; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
    }

    const checklist = task.data_json?.checklist || []
    const completedCount = checklist.filter((i: any) => i.completed).length
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="group/card p-5 bg-[#0f0f11] border border-white/[0.04] rounded-[20px] shadow-sm hover:border-white/[0.1] hover:bg-[#141416] transition-luxury animate-in fade-in slide-in-from-top-1 ease-out overflow-hidden relative cursor-pointer touch-none"
            style={{ ...style, animationDelay: `${index * 30}ms` }}
        >
            <div className="flex items-center gap-2 mb-4 opacity-20 group-hover/card:opacity-40 transition-luxury">
                <Hash size={10} className="text-primary" />
                <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Contexto</span>
            </div>

            <p className="text-[14px] font-medium text-white/90 leading-relaxed mb-6 group-hover:text-white transition-luxury">
                {task.data_json?.[columns[0]?.id] || 'Sem título'}
            </p>

            <div className="space-y-4">
                {checklist.length > 0 && (
                    <div className="space-y-2 pointer-events-none">
                        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-700 ease-in-out ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                        {task.data_json?.attachments?.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[10px] text-white/20 font-medium">
                                <FileText size={10} />
                                <span>{task.data_json.attachments.length}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {task.data_json?.person && (
                            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                {task.data_json.person.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <ChevronRight size={14} className="text-white/5 group-hover/card:translate-x-0.5 group-hover/card:text-white/20 transition-luxury" />
                    </div>
                </div>
            </div>
        </div>
    )
}
