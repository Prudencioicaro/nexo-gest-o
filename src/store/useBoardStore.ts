import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Board } from '../types'

// Cores disponíveis para os quadros
export const BOARD_COLORS = [
    { id: 'blue', hex: '#2383e2', label: 'Azul' },
    { id: 'purple', hex: '#9d68d3', label: 'Roxo' },
    { id: 'pink', hex: '#d15796', label: 'Rosa' },
    { id: 'red', hex: '#df5452', label: 'Vermelho' },
    { id: 'orange', hex: '#cc7d24', label: 'Laranja' },
    { id: 'green', hex: '#529e72', label: 'Verde' },
    { id: 'gray', hex: '#8b8b8b', label: 'Cinza' },
    { id: 'teal', hex: '#4ecdc4', label: 'Turquesa' },
]

// Colunas padrão criadas automaticamente
const DEFAULT_COLUMNS = [
    {
        name: 'Título',
        type: 'text',
        position: 0,
        options: {}
    },
    {
        name: 'Status',
        type: 'status',
        position: 1,
        options: {
            options: [
                { id: 'backlog', label: 'Backlog', color: 'Gray' },
                { id: 'todo', label: 'A Fazer', color: 'Blue' },
                { id: 'in_progress', label: 'Em Andamento', color: 'Yellow' },
                { id: 'done', label: 'Concluído', color: 'Green' },
            ]
        }
    },
    {
        name: 'Responsável',
        type: 'person',
        position: 2,
        options: {}
    },
    {
        name: 'Prazo',
        type: 'date',
        position: 3,
        options: {}
    }
]

interface BoardState {
    boards: Board[]
    loading: boolean
    fetchBoards: () => Promise<void>
    createBoard: (name: string, userId: string, color?: string) => Promise<Board | null>
    updateBoard: (boardId: string, updates: Partial<Board>) => Promise<void>
    deleteBoard: (boardId: string) => Promise<{ error: any | null }>
}

export const useBoardStore = create<BoardState>((set, get) => ({
    boards: [],
    loading: false,

    fetchBoards: async () => {
        set({ loading: true })
        const { data, error } = await supabase
            .from('boards')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erro ao buscar quadros:', error)
            set({ loading: false })
            return
        }

        set({ boards: data || [], loading: false })
    },

    createBoard: async (name, userId, color = '#2383e2') => {
        try {
            // 1. Criar o quadro
            const { data: board, error: boardError } = await supabase
                .from('boards')
                .insert([{ name, owner_id: userId, color }])
                .select()
                .single()

            if (boardError) {
                console.error('Erro ao criar quadro:', boardError)
                throw boardError
            }

            // 2. Criar colunas padrão
            const columnsToInsert = DEFAULT_COLUMNS.map(col => ({
                ...col,
                board_id: board.id
            }))

            const { error: colsError } = await supabase
                .from('board_columns')
                .insert(columnsToInsert)

            if (colsError) {
                console.error('Erro ao criar colunas padrão:', colsError)
            }

            set((state) => ({ boards: [board, ...state.boards] }))
            return board
        } catch (error: any) {
            alert('Erro ao criar quadro: ' + (error.message || 'Erro desconhecido'))
            return null
        }
    },

    updateBoard: async (boardId, updates) => {
        const oldBoards = get().boards

        // Optimistic update
        set((state) => ({
            boards: state.boards.map(b =>
                b.id === boardId ? { ...b, ...updates } : b
            )
        }))

        const { error } = await supabase
            .from('boards')
            .update(updates)
            .eq('id', boardId)

        if (error) {
            console.error('Erro ao atualizar quadro:', error)
            set({ boards: oldBoards })
        }
    },

    deleteBoard: async (boardId) => {
        const boardToDelete = get().boards.find(b => b.id === boardId)

        if (!boardToDelete) return { error: 'Board not found' }

        // Optimistic update
        set((state) => ({
            boards: state.boards.filter(b => b.id !== boardId)
        }))

        const { error } = await supabase
            .from('boards')
            .delete()
            .eq('id', boardId)

        if (error) {
            console.error('Erro ao excluir quadro:', error)
            // Rollback
            set((state) => ({
                boards: [boardToDelete, ...state.boards]
            }))
            return { error }
        }

        return { error: null }
    },
}))
