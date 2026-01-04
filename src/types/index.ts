export type BoardRole = 'owner' | 'editor' | 'viewer'

export interface Board {
    id: string
    name: string
    owner_id: string
    created_at: string
    updated_at: string
}

export interface BoardMember {
    id: string
    board_id: string
    user_id: string
    role: BoardRole
}

export type ColumnType = 'text' | 'number' | 'status' | 'person' | 'date' | 'tag' | 'boolean'

export interface BoardColumn {
    id: string
    board_id: string
    name: string
    type: ColumnType
    is_required: boolean
    options?: any
    position: number
}

export interface Task {
    id: string
    board_id: string
    data_json: Record<string, any>
    created_at: string
    updated_at: string
    position: number
}

export interface BoardView {
    id: string
    board_id: string
    name: string
    type: 'list' | 'kanban' | 'calendar'
    config: Record<string, any>
}
