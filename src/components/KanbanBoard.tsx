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
import { FileText, Plus, MoreHorizontal, ChevronRight } from 'lucide-react'

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
            <div className="flex gap-8 p-4 md:p-12 h-fit min-h-full items-start overflow-x-auto custom-scrollbar bg-[#121212]">
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
                    <div className="w-80 p-5 bg-[#1c1c1c] border border-white/5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] rotate-[2deg] cursor-grabbing backdrop-blur-xl scale-105 transition-transform duration-200">
                        <div className="w-8 h-1 bg-[#2383e2] rounded-full mb-4" />
                        <p className="text-[14px] font-bold text-white leading-relaxed">{activeTask.data_json?.[columns[0]?.id] || 'Tarefa sem título'}</p>
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
        'Default': { bg: '#373737', text: '#ffffff' },
        'Gray': { bg: '#454b4e', text: '#9b9b9b' },
        'Blue': { bg: '#3a4a59', text: '#5e87c9' },
        'Green': { bg: '#3a5948', text: '#529e72' },
        'Yellow': { bg: '#59543a', text: '#c29243' },
        'Orange': { bg: '#594a3a', text: '#cc7d24' },
        'Red': { bg: '#593a3a', text: '#df5452' },
        'Purple': { bg: '#4a3a59', text: '#9d68d3' },
        'Pink': { bg: '#593a4a', text: '#d15796' },
    }

    const colorStyles = NOTION_COLORS[color] || NOTION_COLORS['Default']

    return (
        <div ref={setNodeRef} className="w-80 shrink-0 flex flex-col gap-5 group/column">
            <div className="flex items-center justify-between px-3 text-[#8b8b8b]">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div
                        className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[2px] shadow-sm border border-black/20"
                        style={{ backgroundColor: colorStyles.bg, color: colorStyles.text }}
                    >
                        {label}
                    </div>
                    <span className="text-xs font-black text-white/20">{tasks.length}</span>
                </div>
                <div className="flex items-center gap-3 opacity-0 group-hover/column:opacity-100 transition-all duration-300">
                    <button onClick={() => onCreateTask()} className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all">
                        <Plus size={16} />
                    </button>
                    <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/30 hover:text-white transition-all">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>

            <div className={`flex-1 space-y-3 min-h-[500px] p-2 rounded-2xl transition-all duration-300 ${isOver ? 'bg-white/[0.01] ring-1 ring-inset ring-white/5' : ''}`}>
                {tasks.map((task, idx) => (
                    <SortableTaskCard
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick(task)}
                        columns={columns}
                        index={idx}
                    />
                ))}

                {/* Drop Indicator (Shadow like Trello) */}
                {isOver && (
                    <div className="w-full h-24 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-2xl animate-pulse" />
                )}

                <button
                    onClick={() => onCreateTask()}
                    className="w-full flex items-center justify-center gap-2 py-3 text-white/20 hover:text-white/60 hover:bg-white/5 rounded-xl transition-all text-[11px] font-bold uppercase tracking-widest group/btn border border-white/5 shadow-sm"
                >
                    <Plus size={14} />
                    <span>Novo Card</span>
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
            className={`group/card p-4 bg-[#1c1c1c] border border-white/5 rounded-xl shadow-sm hover:border-white/20 hover:bg-[#202020] transition-all duration-200 animate-in fade-in slide-in-from-top-1 ease-out overflow-hidden relative cursor-grab active:cursor-grabbing`}
            style={{ ...style, animationDelay: `${index * 50}ms` }}
        >
            <div className="flex-1 min-w-0" onClick={onClick}>
                <div className="flex items-center gap-2 mb-2 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2383e2]" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Tarefa</span>
                </div>

                <p className="text-[13px] font-bold text-white leading-relaxed mb-4">
                    {task.data_json?.[columns[0]?.id] || 'Tarefa sem título'}
                </p>

                <div className="space-y-3">
                    {checklist.length > 0 && (
                        <div className="space-y-1.5 pointer-events-none">
                            <div className="flex items-center justify-between text-[9px] text-white/20 font-bold uppercase tracking-widest">
                                <span>{progress}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-[#529e72]' : 'bg-[#2383e2]'}`}
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex items-center justify-between pointer-events-none">
                        <div className="flex items-center gap-2">
                            {task.data_json?.attachments?.length > 0 && (
                                <div className="flex items-center gap-1.5 text-[9px] text-white/30 font-bold">
                                    <FileText size={10} />
                                    <span>{task.data_json.attachments.length}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {task.data_json?.person && (
                                <div className="w-5 h-5 rounded bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-bold text-white/40 uppercase">
                                    {task.data_json.person.charAt(0)}
                                </div>
                            )}
                            <ChevronRight size={14} className="text-white/5 group-hover/card:text-white/20 transition-colors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
