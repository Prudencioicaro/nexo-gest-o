import { useMemo, useState } from 'react'
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    addMonths,
    subMonths,
    isToday
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, FileText } from 'lucide-react'
import type { Task, BoardColumn } from '../types'

interface CalendarViewProps {
    tasks: Task[]
    columns: BoardColumn[]
    onTaskClick: (task: Task) => void
    onCreateTask: (initialData?: Record<string, any>) => void
}

export function CalendarView({ tasks, columns, onTaskClick, onCreateTask }: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const dateColumn = columns.find(c => c.type === 'date')

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    })

    const tasksByDay = useMemo(() => {
        if (!dateColumn) return {}
        const map: Record<string, Task[]> = {}
        tasks.forEach(task => {
            const dateStr = task.data_json?.[dateColumn.id]
            if (dateStr) {
                // Ao usar new Date(dateStr), o JS assume UTC se for apenas data (yyyy-MM-dd)
                // Adicionamos 'T12:00:00' para garantir que caia no dia certo independente do fuso
                const d = format(new Date(dateStr + 'T12:00:00'), 'yyyy-MM-dd')
                if (!map[d]) map[d] = []
                map[d].push(task)
            }
        })
        return map
    }, [tasks, dateColumn])

    return (
        <div className="flex flex-col h-full bg-[#191919] animate-in fade-in duration-500">
            {/* Calendar Header */}
            <div className="px-12 py-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white capitalize">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </h2>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                            className="p-1.5 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] hover:text-white transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="px-3 py-1 text-xs font-bold text-[#8b8b8b] hover:bg-[#2c2c2c] hover:text-white rounded border border-[#2f2f2f] transition-all"
                        >
                            Hoje
                        </button>
                        <button
                            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                            className="p-1.5 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] hover:text-white transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {!dateColumn && (
                    <div className="text-xs text-[#df5452] bg-[#df5452]/10 px-3 py-1.5 rounded border border-[#df5452]/20 font-medium">
                        Adicione uma coluna de <b>Data</b> para ver as tarefas no calendário.
                    </div>
                )}
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 border-t border-[#2f2f2f] bg-[#1d1d1d]">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-bold text-[#8b8b8b] uppercase tracking-widest border-r border-[#2f2f2f]">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid Days */}
            <div className="flex-1 grid grid-cols-7 border-t border-[#2f2f2f] overflow-y-auto custom-scrollbar">
                {calendarDays.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd')
                    const dayTasks = tasksByDay[dateStr] || []
                    const isCurrentMonth = isSameMonth(day, monthStart)
                    const isTodayDate = isToday(day)

                    return (
                        <div
                            key={dateStr}
                            className={`min-h-[120px] p-2 border-r border-b border-[#2f2f2f] transition-colors group ${!isCurrentMonth ? 'bg-[#191919]/50' : 'bg-[#191919]'}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isTodayDate ? 'bg-[#2383e2] text-white' : isCurrentMonth ? 'text-[#ffffff]' : 'text-[#444]'}`}>
                                    {format(day, 'd')}
                                </span>
                                <button
                                    onClick={() => onCreateTask({ [dateColumn?.id || 'date']: dateStr })}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#2c2c2c] rounded text-[#8b8b8b] transition-all"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>

                            <div className="space-y-1">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => onTaskClick(task)}
                                        className="px-2 py-1 bg-[#2c2c2c] border border-[#373737] rounded text-[11px] text-white font-medium truncate cursor-pointer hover:border-[#2383e2] transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        <FileText size={10} className="text-[#8b8b8b] shrink-0" />
                                        <span>{task.data_json?.title || task.data_json?.[columns[0]?.id] || 'Sem título'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
