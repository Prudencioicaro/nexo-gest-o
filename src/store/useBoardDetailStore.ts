import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { BoardColumn, Task, BoardView } from '../types'

interface BoardDetailState {
    columns: BoardColumn[]
    tasks: Task[]
    views: BoardView[]
    members: any[]
    activeView: BoardView | null
    loading: boolean

    fetchBoardData: (boardId: string) => Promise<void>
    fetchMembers: (boardId: string) => Promise<void>
    inviteMember: (boardId: string, email: string) => Promise<void>
    removeMember: (memberId: string) => Promise<void>
    addColumn: (boardId: string, name: string, type: any, customOptions?: any) => Promise<void>
    updateColumn: (columnId: string, updates: Partial<BoardColumn>) => Promise<void>
    deleteColumn: (columnId: string) => Promise<void>
    reorderColumn: (columnId: string, newPosition: number) => Promise<void>
    addTask: (boardId: string, data: Record<string, any>) => Promise<string | null>
    updateTask: (taskId: string, data: Record<string, any>) => Promise<void>
    deleteTask: (taskId: string) => Promise<void>
    uploadFile: (file: File) => Promise<string | null>
}

export const useBoardDetailStore = create<BoardDetailState>((set, get) => ({
    columns: [],
    tasks: [],
    views: [],
    members: [],
    activeView: null,
    loading: false,

    fetchBoardData: async (boardId) => {
        set({ loading: true })

        const [colsRes, tasksRes, viewsRes, membersRes] = await Promise.all([
            supabase.from('board_columns').select('*').eq('board_id', boardId).order('position'),
            supabase.from('tasks').select('*').eq('board_id', boardId).order('position'),
            supabase.from('views').select('*').eq('board_id', boardId),
            supabase.from('board_members').select('*, profiles(email, full_name, avatar_url)').eq('board_id', boardId)
        ])

        set({
            columns: colsRes.data || [],
            tasks: tasksRes.data || [],
            views: viewsRes.data || [],
            activeView: viewsRes.data?.[0] || null,
            members: membersRes.data || [],
            loading: false
        })
    },

    fetchMembers: async (boardId) => {
        const { data } = await supabase
            .from('board_members')
            .select('*, profiles(email, full_name, avatar_url)')
            .eq('board_id', boardId)
        set({ members: data || [] })
    },

    inviteMember: async (boardId, email) => {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single()

        if (profileError || !profile) {
            throw new Error('Usuário não encontrado com este e-mail.')
        }

        const { error } = await supabase
            .from('board_members')
            .insert([{ board_id: boardId, user_id: profile.id, role: 'editor' }])

        if (error) {
            if (error.code === '23505') throw new Error('Este usuário já é membro do quadro.')
            throw error
        }

        await get().fetchMembers(boardId)
    },

    removeMember: async (memberId) => {
        const { error } = await supabase
            .from('board_members')
            .delete()
            .eq('id', memberId)

        if (!error) {
            set((state) => ({ members: state.members.filter(m => m.id !== memberId) }))
        }
    },

    addColumn: async (boardId, name, type, customOptions) => {
        const newPos = get().columns.length
        let options = customOptions || {}

        // Se não há opções customizadas e é um tipo que precisa de opções, usar padrão
        if (!customOptions && (type === 'status' || type === 'select' || type === 'multiselect')) {
            options = {
                options: [
                    { id: 'backlog', label: 'Backlog', color: 'Gray' },
                    { id: 'todo', label: 'A Fazer', color: 'Blue' },
                    { id: 'in_progress', label: 'Em Andamento', color: 'Yellow' },
                    { id: 'done', label: 'Concluído', color: 'Green' },
                ]
            }
        }

        const { data } = await supabase
            .from('board_columns')
            .insert([{ board_id: boardId, name, type, position: newPos, options }])
            .select()
            .single()

        if (data) {
            set((state) => ({ columns: [...state.columns, data] }))
        }
    },

    updateColumn: async (columnId, updates) => {
        const oldColumns = get().columns
        set((state) => ({
            columns: state.columns.map(c => c.id === columnId ? { ...c, ...updates } : c)
        }))

        const { error } = await supabase
            .from('board_columns')
            .update(updates)
            .eq('id', columnId)

        if (error) {
            set({ columns: oldColumns })
            console.error('Erro ao atualizar coluna:', error)
        }
    },

    reorderColumn: async (columnId, newPosition) => {
        const oldColumns = get().columns
        const columnIndex = oldColumns.findIndex(c => c.id === columnId)
        if (columnIndex === -1) return

        // Create new ordered array
        const reorderedColumns = [...oldColumns]
        const [moved] = reorderedColumns.splice(columnIndex, 1)
        reorderedColumns.splice(newPosition, 0, moved)

        // Update positions
        const updatedColumns = reorderedColumns.map((col, idx) => ({ ...col, position: idx }))
        set({ columns: updatedColumns })

        // Batch update positions in database
        try {
            const updates = updatedColumns.map(col =>
                supabase.from('board_columns').update({ position: col.position }).eq('id', col.id)
            )
            await Promise.all(updates)
        } catch (error) {
            set({ columns: oldColumns })
            console.error('Erro ao reordenar colunas:', error)
        }
    },

    deleteColumn: async (columnId) => {
        const oldColumns = get().columns
        set((state) => ({
            columns: state.columns.filter(c => c.id !== columnId)
        }))

        const { error } = await supabase
            .from('board_columns')
            .delete()
            .eq('id', columnId)

        if (error) {
            set({ columns: oldColumns })
            console.error('Erro ao deletar coluna:', error)
        }
    },

    addTask: async (boardId, data_json) => {
        const tempId = crypto.randomUUID()
        const newTask = { id: tempId, board_id: boardId, data_json, position: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }

        set((state) => ({ tasks: [newTask, ...state.tasks] }))

        const { data, error } = await supabase
            .from('tasks')
            .insert([{ board_id: boardId, data_json }])
            .select()
            .single()

        if (error) {
            set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }))
            return null
        } else {
            set((state) => ({ tasks: state.tasks.map(t => t.id === tempId ? data : t) }))
            return data.id
        }
    },

    updateTask: async (taskId, data_json) => {
        const oldTasks = get().tasks
        const updatedTasks = oldTasks.map(t => {
            if (t.id === taskId) {
                return {
                    ...t,
                    data_json: { ...t.data_json, ...data_json },
                    updated_at: new Date().toISOString()
                }
            }
            return t
        })

        set({ tasks: updatedTasks })

        const { error } = await supabase
            .from('tasks')
            .update({
                data_json: { ...oldTasks.find(t => t.id === taskId)?.data_json, ...data_json },
                updated_at: new Date().toISOString()
            })
            .eq('id', taskId)

        if (error) {
            console.error('Erro ao atualizar tarefa:', error)
            set({ tasks: oldTasks })
        }
    },

    deleteTask: async (taskId) => {
        const oldTasks = get().tasks
        set((state) => ({ tasks: state.tasks.filter(t => t.id !== taskId) }))

        const { error } = await supabase.from('tasks').delete().eq('id', taskId)
        if (error) set({ tasks: oldTasks })
    },

    uploadFile: async (file) => {
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `tasks/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('attachments')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) {
                console.error('Erro detalhado no upload:', uploadError)
                alert(`Erro no upload: ${uploadError.message}. Verifique se o bucket "attachments" existe no Supabase.`)
                return null
            }

            const { data: urlData } = supabase.storage
                .from('attachments')
                .getPublicUrl(filePath)

            return urlData.publicUrl
        } catch (err: any) {
            console.error('Erro inesperado no upload:', err)
            return null
        }
    }
}))
