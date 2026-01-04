import { useEffect, useState, useRef, useMemo } from 'react'
import { useBoardDetailStore } from '../store/useBoardDetailStore'
import { AddColumnModal } from '../components/modals/AddColumnModal'
import { TaskDetailSidebar } from '../components/TaskDetailSidebar'
import { KanbanBoard } from '../components/KanbanBoard'
import { BoardStats } from '../components/BoardStats'
import { CalendarView } from '../components/CalendarView'
import { FilterMenu } from '../components/FilterMenu'
import type { FilterRule } from '../components/FilterMenu'
import { ShareBoardModal } from '../components/modals/ShareBoardModal'
import { ColumnSettingsModal } from '../components/modals/ColumnSettingsModal'
import type { Board, BoardColumn } from '../types'
import {
    Plus,
    LayoutGrid,
    Search,
    Type,
    PlusCircle,
    Calendar,
    Users,
    Settings2,
    List as ListIcon,
    CalendarDays,
    Hash,
    CheckSquare,
    BarChart3,
    FileText,
    Check,
    GripVertical
} from 'lucide-react'

interface BoardViewPageProps {
    board: Board
    onBack: () => void
}

export function BoardViewPage({ board }: BoardViewPageProps) {
    const {
        columns = [],
        tasks = [],
        loading,
        fetchBoardData,
        addColumn,
        updateTask,
        updateColumn,
        deleteColumn
    } = useBoardDetailStore()

    const [activeTab, setActiveTab] = useState<'geral' | 'kanban' | 'stats' | 'calendar'>('geral')
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [filterRules, setFilterRules] = useState<FilterRule[]>([])
    const [pageSize, setPageSize] = useState(20)

    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchBoardData(board.id)
    }, [board.id, fetchBoardData])

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearchOpen])

    const filteredTasks = useMemo(() => {
        let result = tasks

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(task => {
                return Object.values(task.data_json || {}).some(val =>
                    String(val).toLowerCase().includes(query)
                )
            })
        }

        if (filterRules.length > 0) {
            result = result.filter(task => {
                return filterRules.every(rule => {
                    const val = task.data_json?.[rule.columnId] || ''
                    const target = rule.value.toLowerCase()
                    const current = String(val).toLowerCase()

                    switch (rule.operator) {
                        case 'contains': return current.includes(target)
                        case 'equals': return current === target
                        case 'not_equals': return current !== target
                        case 'is_empty': return !val
                        case 'is_not_empty': return !!val
                        default: return true
                    }
                })
            })
        }

        return result
    }, [tasks, searchQuery, filterRules])

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
                return value.toLocaleString('pt-BR')
        }
    }

    const getColIcon = (type: string) => {
        switch (type) {
            case 'text': return <Type size={14} className="opacity-50" />
            case 'status': return <ListIcon size={14} className="opacity-50" />
            case 'date': return <CalendarDays size={14} className="opacity-50" />
            case 'number': return <Hash size={14} className="opacity-50" />
            case 'boolean': return <CheckSquare size={14} className="opacity-50" />
            case 'person': return <Users size={14} className="opacity-50" />
            default: return <Type size={14} className="opacity-50" />
        }
    }

    const handleCreateTask = async (initialData: Record<string, any> = {}) => {
        const firstColumn = columns[0]
        const data_json = {
            [firstColumn?.id || 'title']: '',
            ...initialData
        }
        const newTaskId = await useBoardDetailStore.getState().addTask(board.id, data_json)
        if (newTaskId) {
            setSelectedTaskId(newTaskId)
            setPageSize(prev => prev + 1) // Garante que a nova tarefa apareça se estiver no limite
        }
    }

    const handleColumnUpdate = (taskId: string, colId: string, value: any) => {
        updateTask(taskId, { [colId]: value })
    }

    if (loading && columns.length === 0) {
        return (
            <div className="flex-1 p-12 space-y-8 animate-pulse">
                <div className="h-10 bg-[#2c2c2c] rounded w-1/3" />
                <div className="space-y-4">
                    <div className="h-8 bg-[#2c2c2c] rounded w-full" />
                    <div className="h-8 bg-[#2c2c2c] rounded w-full" />
                    <div className="h-8 bg-[#2c2c2c] rounded w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-[#191919] select-none relative">
            {/* Context Overlay / Blur when Sidebar is open */}
            <div
                className={`absolute inset-0 bg-black/20 backdrop-blur-[2px] z-40 transition-all duration-300 pointer-events-none ${selectedTaskId ? 'opacity-100' : 'opacity-0'}`}
            />

            {/* Toolbar */}
            <div className="px-11 flex items-center justify-between border-b border-[#2f2f2f] h-10 shrink-0 bg-[#191919] z-10">
                <div className="flex items-center h-full overflow-x-auto no-scrollbar scroll-smooth">
                    <button
                        className={`flex items-center gap-1.5 px-3 h-full text-[13px] font-medium transition-all relative shrink-0 ${activeTab === 'geral' ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
                        onClick={() => setActiveTab('geral')}
                    >
                        <LayoutGrid size={14} />
                        <span>Tabela</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 px-3 h-full text-[13px] font-medium transition-all relative shrink-0 ${activeTab === 'kanban' ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
                        onClick={() => setActiveTab('kanban')}
                    >
                        <LayoutGrid size={14} />
                        <span>Quadro</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 px-3 h-full text-[13px] font-medium transition-all relative shrink-0 ${activeTab === 'calendar' ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
                        onClick={() => setActiveTab('calendar')}
                    >
                        <Calendar size={14} />
                        <span>Calendário</span>
                    </button>

                    <button
                        className={`flex items-center gap-1.5 px-3 h-full text-[13px] font-medium transition-all relative shrink-0 ${activeTab === 'stats' ? 'text-white after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-white' : 'text-[#8b8b8b] hover:bg-[#2c2c2c]'}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        <BarChart3 size={14} />
                        <span>Insights</span>
                    </button>
                </div>

                <div className="flex items-center gap-1 px-4 ml-auto">
                    <div className={`flex items-center gap-2 transition-all duration-300 ${isSearchOpen ? 'w-32 md:w-48 bg-[#2c2c2c] px-2 py-1 rounded' : 'w-8'}`}>
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="text-[#8b8b8b] hover:text-white transition-colors p-1"
                        >
                            <Search size={15} />
                        </button>
                        {isSearchOpen && (
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Pesquisar..."
                                className="bg-transparent border-none outline-none text-xs w-full text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        )}
                    </div>

                    <div className="hidden md:block">
                        <FilterMenu
                            columns={columns}
                            rules={filterRules}
                            onChange={setFilterRules}
                        />
                    </div>
                </div>
            </div>

            {/* Main Database Area */}
            <div className="flex-1 overflow-auto relative custom-scrollbar">
                {columns.length > 0 ? (
                    <>
                        {activeTab === 'geral' && (
                            <table className="w-full border-collapse text-[13px]">
                                <thead>
                                    <tr className="h-8 border-b border-[#2f2f2f]">
                                        <th className="sticky left-0 z-20 bg-[#191919] border-r border-[#2f2f2f] px-12 font-medium text-[#8b8b8b] w-[280px] text-left hover:bg-[#2c2c2c] cursor-pointer" onClick={() => setEditingColumn(columns[0])}>
                                            <div className="flex items-center gap-2">
                                                <Type size={14} />
                                                <span>{columns[0]?.name || 'Nome'}</span>
                                            </div>
                                        </th>
                                        {columns.slice(1).map(col => (
                                            <th key={col.id} className="border-r border-[#2f2f2f] px-4 font-medium text-[#8b8b8b] w-[200px] text-left hover:bg-[#2c2c2c] cursor-pointer group" onClick={() => setEditingColumn(col)}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        {getColIcon(col.type)}
                                                        <span>{col.name}</span>
                                                    </div>
                                                    <Settings2 size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </th>
                                        ))}
                                        <th className="w-10 md:w-16 min-w-[60px] border-r border-[#2f2f2f] hover:bg-[#2c2c2c] cursor-pointer transition-colors p-0" onClick={() => setIsAddingColumn(true)}>
                                            <div className="w-full h-full flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-lg bg-[#2c2c2c]/50 flex items-center justify-center hover:bg-[#2c2c2c] hover:text-white transition-all">
                                                    <Plus size={18} className="text-[#8b8b8b]" />
                                                </div>
                                            </div>
                                        </th>
                                        <th className="bg-[#191919] flex-1"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.slice(0, pageSize).map((task, idx) => (
                                        <tr
                                            key={task.id}
                                            className="h-8 border-b border-[#2f2f2f] hover:bg-[#2c2c2c]/30 group transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
                                            style={{ animationDelay: `${idx * 20}ms` }}
                                        >
                                            <td className="sticky left-0 z-10 bg-[#191919] group-hover:bg-[#252525] border-r border-[#2f2f2f] px-4 md:px-12 relative">
                                                <div className="flex items-center gap-2 h-full">
                                                    <GripVertical size={12} className="text-[#8b8b8b] opacity-0 group-hover:opacity-40 -ml-6 transition-opacity cursor-grab active:cursor-grabbing hidden md:block" />
                                                    <FileText size={14} className="text-[#8b8b8b] shrink-0" />
                                                    <input
                                                        className="bg-transparent border-none outline-none w-full h-full text-white font-medium truncate"
                                                        value={task.data_json?.[columns[0]?.id] || ''}
                                                        onChange={(e) => handleColumnUpdate(task.id, columns[0]?.id, e.target.value)}
                                                        placeholder="Vazio"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => setSelectedTaskId(task.id)}
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-[#373737] rounded transition-all text-[11px] text-[#8b8b8b] hover:text-white hidden md:block"
                                                >
                                                    ABRIR
                                                </button>
                                                {/* Mobile Open Button */}
                                                <button
                                                    onClick={() => setSelectedTaskId(task.id)}
                                                    className="md:hidden absolute inset-0 z-0"
                                                />
                                            </td>
                                            {columns.slice(1).map(col => (
                                                <td key={col.id} className="border-r border-[#2f2f2f] h-8 relative">
                                                    {col.type === 'status' ? (
                                                        <select
                                                            className="bg-transparent border-none outline-none w-full h-full px-4 text-white appearance-none cursor-pointer hover:bg-[#2c2c2c]/50 transition-colors"
                                                            value={task.data_json?.[col.id] || ''}
                                                            onChange={(e) => handleColumnUpdate(task.id, col.id, e.target.value)}
                                                        >
                                                            <option value="" className="bg-[#191919]">Vazio</option>
                                                            {col.options?.options?.map((opt: any) => (
                                                                <option key={opt.id} value={opt.id} className="bg-[#191919]">{opt.label}</option>
                                                            ))}
                                                        </select>
                                                    ) : col.type === 'boolean' ? (
                                                        <div className="flex items-center justify-center h-full">
                                                            <button
                                                                onClick={() => handleColumnUpdate(task.id, col.id, !task.data_json?.[col.id])}
                                                                className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${task.data_json?.[col.id] ? 'bg-[#2383e2] border-[#2383e2]' : 'border-[#2f2f2f] hover:border-[#8b8b8b]'}`}
                                                            >
                                                                {task.data_json?.[col.id] && <Check size={12} className="text-white" />}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative w-full h-full group/cell">
                                                            <input
                                                                className="bg-transparent border-none outline-none w-full h-full px-4 text-white hover:bg-[#2c2c2c]/50 transition-colors opacity-0 absolute inset-0 z-10 focus:opacity-100"
                                                                value={task.data_json?.[col.id] || ''}
                                                                onChange={(e) => handleColumnUpdate(task.id, col.id, e.target.value)}
                                                                type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                                            />
                                                            <div className="w-full h-full px-4 flex items-center text-white pointer-events-none group-focus-within/cell:hidden truncate text-xs md:text-[13px]">
                                                                {col.type === 'number'
                                                                    ? formatNumber(task.data_json?.[col.id], col.options?.numberFormat)
                                                                    : task.data_json?.[col.id] || ''
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>
                                            ))}
                                            <td className="w-10 border-r border-[#2f2f2f]"></td>
                                            <td className="bg-transparent flex-1"></td>
                                        </tr>
                                    ))}

                                    {filteredTasks.length > pageSize && (
                                        <tr className="h-10 hover:bg-[#2c2c2c]/30">
                                            <td
                                                colSpan={columns.length + 1}
                                                className="px-12 text-center"
                                            >
                                                <button
                                                    onClick={() => setPageSize(prev => prev + 20)}
                                                    className="text-[#2383e2] hover:text-[#2a8ff5] font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-lg hover:bg-[#2383e2]/5 transition-all"
                                                >
                                                    Ver mais ({filteredTasks.length - pageSize} restantes)
                                                </button>
                                            </td>
                                        </tr>
                                    )}
                                    <tr className="h-10">
                                        <td
                                            className="sticky left-0 bg-[#191919] border-r border-[#2f2f2f] px-12 text-[#8b8b8b] hover:bg-[#2c2c2c] cursor-pointer transition-colors"
                                            onClick={() => handleCreateTask()}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Plus size={14} />
                                                <span>Novo</span>
                                            </div>
                                        </td>
                                        {columns.slice(1).map(col => (
                                            <td key={col.id} className="border-r border-[#2f2f2f]"></td>
                                        ))}
                                        <td className="border-r border-[#2f2f2f]"></td>
                                        <td className="flex-1"></td>
                                    </tr>
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'kanban' && (
                            <KanbanBoard
                                tasks={filteredTasks}
                                columns={columns}
                                onTaskUpdate={updateTask}
                                onTaskClick={(t) => setSelectedTaskId(t.id)}
                                onCreateTask={handleCreateTask}
                            />
                        )}

                        {activeTab === 'calendar' && (
                            <CalendarView
                                tasks={filteredTasks}
                                columns={columns}
                                onTaskClick={(t) => setSelectedTaskId(t.id)}
                                onCreateTask={handleCreateTask}
                            />
                        )}

                        {activeTab === 'stats' && (
                            <BoardStats tasks={tasks} columns={columns} />
                        )}
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center p-20 text-center animate-in fade-in">
                        <div className="max-w-sm">
                            <PlusCircle size={48} className="text-[#2383e2] mx-auto mb-6 opacity-30" />
                            <h2 className="text-xl font-bold mb-2 text-white">Estruturar Quadro</h2>
                            <p className="text-[#8b8b8b] text-sm mb-8 leading-relaxed">Este banco de dados ainda não tem propriedades definidas.</p>
                            <button
                                onClick={() => setIsAddingColumn(true)}
                                className="bg-[#2383e2] hover:bg-[#2a8ff5] text-white px-6 py-2 rounded font-bold text-sm transition-all shadow-lg shadow-[#2383e2]/20"
                            >
                                ADICIONAR PROPRIEDADE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isAddingColumn && (
                <AddColumnModal
                    onClose={() => setIsAddingColumn(false)}
                    onAdd={(name, type) => addColumn(board.id, name, type)}
                />
            )}

            {isSharing && (
                <ShareBoardModal
                    board={board}
                    onClose={() => setIsSharing(false)}
                />
            )}

            {editingColumn && (
                <ColumnSettingsModal
                    column={editingColumn}
                    onClose={() => setEditingColumn(null)}
                    onUpdate={updateColumn}
                    onDelete={deleteColumn}
                />
            )}

            {selectedTaskId && (
                <TaskDetailSidebar
                    taskId={selectedTaskId}
                    columns={columns}
                    onClose={() => setSelectedTaskId(null)}
                />
            )}
        </div>
    )
}
