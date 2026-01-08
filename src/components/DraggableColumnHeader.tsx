import { useMemo, useState } from 'react'
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    useSensor,
    useSensors,
    closestCenter,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { BoardColumn } from '../types'
import { Type, List, CalendarDays, Hash, CheckSquare, Users, Settings2, GripVertical, Tag, Tags } from 'lucide-react'
import { ColumnSettingsDropdown } from './modals/ColumnSettingsDropdown'

function getColIcon(type: string) {
    switch (type) {
        case 'text': return <Type size={14} className="opacity-50" />
        case 'status': return <List size={14} className="opacity-50" />
        case 'select': return <Tag size={14} className="opacity-50" />
        case 'multiselect': return <Tags size={14} className="opacity-50" />
        case 'date': return <CalendarDays size={14} className="opacity-50" />
        case 'number': return <Hash size={14} className="opacity-50" />
        case 'boolean': return <CheckSquare size={14} className="opacity-50" />
        case 'person': return <Users size={14} className="opacity-50" />
        default: return <Type size={14} className="opacity-50" />
    }
}

interface SortableColumnProps {
    column: BoardColumn
    onClick: () => void
    isFirst?: boolean
    isEditing?: boolean
    onCloseSettings?: () => void
    onUpdate?: (columnId: string, updates: Partial<BoardColumn>) => void
    onDelete?: (columnId: string) => void
}

export function SortableColumn({ column, onClick, isFirst, isEditing, onCloseSettings, onUpdate, onDelete }: SortableColumnProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: `col-${column.id}`,
        disabled: isFirst
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    if (isFirst) {
        return (
            <th
                data-column-id={column.id}
                className="sticky left-0 z-20 bg-[#09090b] border-r border-white/[0.04] px-6 font-semibold text-white/20 w-[280px] text-left hover:bg-white/[0.03] cursor-pointer group transition-luxury relative"
                onClick={onClick}
                title="A coluna Título é fixa e não pode ser movida"
            >
                <div className="flex items-center gap-3">
                    <Type size={14} className="opacity-40" />
                    <span className="text-[11px] uppercase tracking-[2px]">{column.name}</span>
                </div>
                {isEditing && (
                    <div onClick={(e) => e.stopPropagation()}>
                        <ColumnSettingsDropdown
                            column={column}
                            onClose={onCloseSettings!}
                            onUpdate={onUpdate!}
                            onDelete={onDelete!}
                        />
                    </div>
                )}
            </th>
        )
    }

    return (
        <th
            ref={setNodeRef}
            style={style}
            data-column-id={column.id}
            className="border-r border-white/[0.04] px-6 font-semibold text-white/20 w-[200px] text-left hover:bg-white/[0.03] cursor-pointer group transition-luxury relative"
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing p-1.5 -ml-2 hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-luxury"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical size={12} className="text-white/20" />
                    </span>
                    {getColIcon(column.type)}
                    <span className="text-[11px] uppercase tracking-[2px]">{column.name}</span>
                </div>
                <Settings2 size={12} className="opacity-0 group-hover:opacity-40 transition-luxury" />
            </div>
            {isEditing && (
                <div onClick={(e) => e.stopPropagation()}>
                    <ColumnSettingsDropdown
                        column={column}
                        onClose={onCloseSettings!}
                        onUpdate={onUpdate!}
                        onDelete={onDelete!}
                    />
                </div>
            )}
        </th>
    )
}

interface ColumnHeadersProps {
    columns: BoardColumn[]
    onColumnClick: (column: BoardColumn) => void
    editingColumnId?: string | null
    onCloseSettings?: () => void
    onUpdate?: (columnId: string, updates: Partial<BoardColumn>) => void
    onDelete?: (columnId: string) => void
}

export function ColumnHeaders({ columns, onColumnClick, editingColumnId, onCloseSettings, onUpdate, onDelete }: ColumnHeadersProps) {
    const sortableColumns = useMemo(() =>
        columns.slice(1).map(col => `col-${col.id}`),
        [columns]
    )

    const firstColumn = columns[0]
    const restColumns = columns.slice(1)

    return (
        <>
            {firstColumn && (
                <SortableColumn
                    column={firstColumn}
                    onClick={() => onColumnClick(firstColumn)}
                    isFirst={true}
                    isEditing={editingColumnId === firstColumn.id}
                    onCloseSettings={onCloseSettings}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                />
            )}

            <SortableContext items={sortableColumns} strategy={horizontalListSortingStrategy}>
                {restColumns.map(col => (
                    <SortableColumn
                        key={col.id}
                        column={col}
                        onClick={() => onColumnClick(col)}
                        isEditing={editingColumnId === col.id}
                        onCloseSettings={onCloseSettings}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                    />
                ))}
            </SortableContext>
        </>
    )
}

// Wrapper component that provides DndContext - should be placed OUTSIDE the table
interface ColumnDndProviderProps {
    columns: BoardColumn[]
    onReorder: (columnId: string, newPosition: number) => void
    children: React.ReactNode
}

export function ColumnDndProvider({ columns, onReorder, children }: ColumnDndProviderProps) {
    const [activeColumn, setActiveColumn] = useState<BoardColumn | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    )

    const handleDragStart = (event: DragStartEvent) => {
        const columnId = String(event.active.id).replace('col-', '')
        const column = columns.find(c => c.id === columnId)
        setActiveColumn(column || null)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveColumn(null)

        const { active, over } = event
        if (!over || active.id === over.id) return

        const activeId = String(active.id).replace('col-', '')
        const overId = String(over.id).replace('col-', '')

        const activeIndex = columns.findIndex(c => c.id === activeId)
        const overIndex = columns.findIndex(c => c.id === overId)

        if (activeIndex !== -1 && overIndex !== -1) {
            onReorder(activeId, overIndex)
        }
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {children}
            <DragOverlay>
                {activeColumn && (
                    <div className="px-4 py-2 bg-[#2c2c2c] border border-[#2383e2] rounded-lg shadow-2xl text-white/80 text-sm font-medium flex items-center gap-2">
                        {getColIcon(activeColumn.type)}
                        {activeColumn.name}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

// Re-export for backwards compatibility
export { ColumnHeaders as DraggableColumnHeader }
