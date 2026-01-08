import { useEffect, useState, useRef, useMemo } from 'react'
import { useBoardDetailStore } from '../store/useBoardDetailStore'
import { AddColumnDropdown } from '../components/modals/AddColumnModal'
import { TaskDetailSidebar } from '../components/TaskDetailSidebar'
import { KanbanBoard } from '../components/KanbanBoard'
import { BoardStats } from '../components/BoardStats'
import { CalendarView } from '../components/CalendarView'
import { FilterMenu } from '../components/FilterMenu'
import type { FilterRule } from '../components/FilterMenu'
import { SelectCell } from '../components/SelectCell'
import { TableSkeleton } from '../components/Skeleton'
import { DraggableColumnHeader, ColumnDndProvider } from '../components/DraggableColumnHeader'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { Board, BoardColumn } from '../types'
import {
    Plus,
    LayoutGrid,
    Search,
    Calendar,
    BarChart3,
    FileText,
    Check,
    ChevronRight,
    Trello,
    PlusCircle,
    Hash,
    Users
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
        deleteColumn,
        reorderColumn
    } = useBoardDetailStore()

    const [activeTab, setActiveTab] = useState<'geral' | 'kanban' | 'stats' | 'calendar'>('geral')
    const [isAddingColumn, setIsAddingColumn] = useState(false)
    const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [filterRules, setFilterRules] = useState<FilterRule[]>([])
    const [pageSize, setPageSize] = useState(25)

    const searchInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchBoardData(board.id)
    }, [board.id, fetchBoardData])

    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus()
        }
    }, [isSearchOpen])

    useKeyboardShortcuts({
        shortcuts: [
            { key: 'Escape', action: () => { setSelectedTaskId(null); setEditingColumn(null); setIsAddingColumn(false); setIsSearchOpen(false); }, description: 'Fechar painel' },
            { key: 'n', ctrl: true, action: () => handleCreateTask(), description: 'Nova tarefa' }
        ],
        enabled: true
    })

    const filteredTasks = useMemo(() => {
        let result = tasks
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(task => Object.values(task.data_json || {}).some(val => String(val).toLowerCase().includes(query)))
        }
        if (filterRules.length > 0) {
            result = result.filter(task => filterRules.every(rule => {
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
            }))
        }
        return result
    }, [tasks, searchQuery, filterRules])

    const handleCreateTask = async (initialData: Record<string, any> = {}) => {
        const firstColumn = columns[0]
        const data_json = { [firstColumn?.id || 'title']: '', ...initialData }
        const newTaskId = await useBoardDetailStore.getState().addTask(board.id, data_json)
        if (newTaskId) {
            setSelectedTaskId(newTaskId)
            setPageSize(prev => prev + 1)
        }
    }

    const handleColumnUpdate = (taskId: string, colId: string, value: any) => {
        updateTask(taskId, { [colId]: value })
    }

    const getColIcon = (type: string) => {
        switch (type) {
            case 'text': return <FileText size={14} className="text-white/10 shrink-0" />
            case 'status': return <LayoutGrid size={14} className="text-white/10 shrink-0" />
            case 'date': return <Calendar size={14} className="text-white/10 shrink-0" />
            case 'number': return <Hash size={14} className="text-white/10 shrink-0" />
            case 'boolean': return <Check size={14} className="text-white/10 shrink-0" />
            case 'person': return <Users size={14} className="text-white/10 shrink-0" />
            default: return <FileText size={14} className="text-white/10 shrink-0" />
        }
    }

    const formatNumberValue = (value: any, format?: string) => {
        if (value === undefined || value === '' || value === null) return ''
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
                return num.toLocaleString('pt-BR')
        }
    }

    if (loading && columns.length === 0) {
        return (
            <div className="flex-1 flex flex-col h-full bg-background mt-4">
                <TableSkeleton columns={5} rows={10} />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-background select-none relative px-2">
            {/* Toolbar */}
            <div className="px-6 flex items-center justify-between h-14 shrink-0 transition-luxury">
                <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
                    {[
                        { id: 'geral', label: 'Tabela', icon: LayoutGrid },
                        { id: 'kanban', label: 'Quadro', icon: Trello },
                        { id: 'calendar', label: 'Calendário', icon: Calendar },
                        { id: 'stats', label: 'Insights', icon: BarChart3 }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-luxury ${activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'}`}
                            onClick={() => setActiveTab(tab.id as any)}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className={`flex items-center gap-2 transition-luxury ${isSearchOpen ? 'w-48 bg-white/[0.04] px-3 py-1.5 rounded-xl border border-white/[0.05]' : 'w-10'}`}>
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-white/20 hover:text-white/60 transition-luxury p-1" title="Pesquisar">
                            <Search size={16} />
                        </button>
                        {isSearchOpen && (
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Filtrar..."
                                className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        )}
                    </div>
                    <FilterMenu columns={columns} rules={filterRules} onChange={setFilterRules} />
                </div>
            </div>

            {/* Main Database Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative rounded-t-[32px] bg-white/[0.015] border-t border-x border-white/[0.03] mx-4">
                {columns.length > 0 ? (
                    <div className="w-full overflow-x-auto custom-scrollbar-x h-fit">
                        {activeTab === 'geral' && (
                            <ColumnDndProvider columns={columns} onReorder={reorderColumn}>
                                <table className="w-full border-collapse text-[13px] table-fixed">
                                    <thead>
                                        <tr className="h-11 border-b border-white/[0.04]">
                                            <DraggableColumnHeader
                                                columns={columns}
                                                onColumnClick={(col) => setEditingColumn(col)}
                                                editingColumnId={editingColumn?.id}
                                                onCloseSettings={() => setEditingColumn(null)}
                                                onUpdate={updateColumn}
                                                onDelete={deleteColumn}
                                            />
                                            <th className="w-16 sticky right-0 z-30 bg-[#09090b] border-l border-white/[0.04] p-0 group/add shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.8)] relative">
                                                <div
                                                    id="add-column-button"
                                                    className="w-full h-full flex items-center justify-center hover:bg-white/[0.05] cursor-pointer transition-luxury px-4"
                                                    onClick={() => setIsAddingColumn(!isAddingColumn)}
                                                >
                                                    <Plus size={16} className="text-white/10 group-hover/add:text-white transition-luxury" />
                                                </div>
                                                {isAddingColumn && <AddColumnDropdown onClose={() => setIsAddingColumn(false)} onAdd={(name, type, options) => addColumn(board.id, name, type, options)} />}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.03]">
                                        {filteredTasks.slice(0, pageSize).map((task, idx) => (
                                            <tr key={task.id} className="h-10 hover:bg-white/[0.02] group transition-luxury animate-in fade-in slide-in-from-top-0.5 duration-300" style={{ animationDelay: `${idx * 15}ms` }}>
                                                {/* Consistent Cell Rendering for ALL columns */}
                                                {columns.map((col, colIdx) => (
                                                    <td
                                                        key={col.id}
                                                        className={`border-r border-white/[0.04] relative group/cell ${colIdx === 0 ? 'sticky left-0 z-10 bg-[#09090b] group-hover:bg-[#0c0c0e] px-6' : 'px-6'}`}
                                                    >
                                                        <div className="flex items-center gap-3 h-full">
                                                            {getColIcon(col.type)}
                                                            <div className="flex-1 relative h-full flex items-center">
                                                                {(col.type === 'status' || col.type === 'select' || col.type === 'multiselect') ? (
                                                                    <SelectCell
                                                                        value={task.data_json?.[col.id] || (col.type === 'multiselect' ? [] : '')}
                                                                        options={col.options?.options || []}
                                                                        onChange={(val) => handleColumnUpdate(task.id, col.id, val)}
                                                                        onUpdateOptions={(newOptions) => updateColumn(col.id, { options: { ...col.options, options: newOptions } })}
                                                                        multiple={col.type === 'multiselect'}
                                                                    />
                                                                ) : col.type === 'boolean' ? (
                                                                    <button
                                                                        onClick={() => handleColumnUpdate(task.id, col.id, !task.data_json?.[col.id])}
                                                                        className={`w-4 h-4 rounded-md border transition-luxury flex items-center justify-center shrink-0 ${task.data_json?.[col.id] ? 'bg-primary border-primary shadow-glow-primary' : 'border-white/10 hover:border-white/30'}`}
                                                                    >
                                                                        {task.data_json?.[col.id] && <Check size={10} className="text-white" />}
                                                                    </button>
                                                                ) : (
                                                                    <div className="w-full flex items-center relative group/input">
                                                                        <input
                                                                            type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                                                                            className={`bg-transparent border-none outline-none w-full text-[13px] font-medium placeholder:text-white/10 hover:bg-white/[0.03] focus:bg-white/[0.05] focus:text-white px-2 -mx-2 py-1 rounded-md transition-all truncate ${col.type === 'number' ? 'text-transparent focus:text-white' : 'text-white/80'}`}
                                                                            value={task.data_json?.[col.id] || ''}
                                                                            onChange={(e) => handleColumnUpdate(task.id, col.id, e.target.value)}
                                                                            placeholder={colIdx === 0 ? "Sem título" : "Vazio"}
                                                                        />
                                                                        {col.type === 'number' && (
                                                                            <span className="pointer-events-none absolute left-0 text-[13px] text-white/50 font-medium group-focus-within/input:hidden truncate max-w-full">
                                                                                {task.data_json?.[col.id]
                                                                                    ? formatNumberValue(task.data_json[col.id], col.options?.numberFormat)
                                                                                    : ""
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {colIdx === 0 && (
                                                            <button
                                                                onClick={() => setSelectedTaskId(task.id)}
                                                                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-lg transition-luxury text-[10px] text-white/40 hover:text-white z-20"
                                                            >
                                                                <span>ABRIR</span>
                                                                <ChevronRight size={10} />
                                                            </button>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="w-16 sticky right-0 z-20 bg-[#09090b] group-hover:bg-[#0c0c0e] border-l border-white/[0.04] transition-luxury shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.8)]"></td>
                                            </tr>
                                        ))}

                                        <tr className="h-12 group/new">
                                            <td className="sticky left-0 z-10 bg-[#09090b] border-r border-white/[0.04] px-6 text-white/20 hover:text-white/60 hover:bg-white/[0.02] cursor-pointer transition-luxury" onClick={() => handleCreateTask()}>
                                                <div className="flex items-center gap-3">
                                                    <Plus size={14} />
                                                    <span className="font-medium">Novo item</span>
                                                </div>
                                            </td>
                                            {columns.slice(1).map(col => <td key={col.id} className="border-r border-white/[0.04]"></td>)}
                                            <td className="w-16 sticky right-0 z-10 bg-[#09090b] group-hover/new:bg-[#0c0c0e] border-l border-white/[0.04] transition-luxury shadow-[-12px_0_20px_-10px_rgba(0,0,0,0.8)]"></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </ColumnDndProvider>
                        )}
                    </div>
                ) : null}

                {activeTab === 'kanban' && <KanbanBoard tasks={filteredTasks} columns={columns} onTaskUpdate={updateTask} onTaskClick={(t) => setSelectedTaskId(t.id)} onCreateTask={handleCreateTask} />}
                {activeTab === 'calendar' && <CalendarView tasks={filteredTasks} columns={columns} onTaskClick={(t) => setSelectedTaskId(t.id)} onCreateTask={handleCreateTask} />}
                {activeTab === 'stats' && <BoardStats tasks={tasks} columns={columns} />}

                {columns.length === 0 && (
                    <div className="flex h-full items-center justify-center p-20 text-center animate-in zoom-in-95 duration-500">
                        <div className="max-w-md space-y-8">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                                <PlusCircle size={32} className="text-primary animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-2xl font-semibold text-white tracking-tight">Estruturar Projeto</h2>
                                <p className="text-white/30 text-sm leading-relaxed">Adicione colunas para definir as propriedades e começar a gerenciar seus itens.</p>
                            </div>
                            <button onClick={() => setIsAddingColumn(true)} className="px-8 py-3 bg-white text-black hover:bg-neutral-200 rounded-full font-bold text-xs transition-luxury shadow-xl">
                                ADICIONAR PROPRIEDADE
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {selectedTaskId && <TaskDetailSidebar taskId={selectedTaskId} columns={columns} onClose={() => setSelectedTaskId(null)} />}
        </div >
    )
}
