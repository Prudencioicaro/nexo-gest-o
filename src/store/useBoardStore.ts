import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Board } from '../types'

interface BoardState {
    boards: Board[]
    loading: boolean
    fetchBoards: () => Promise<void>
    createBoard: (name: string, userId: string) => Promise<Board | null>
}

export const useBoardStore = create<BoardState>((set) => ({
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
    createBoard: async (name, userId) => {
        try {
            const { data, error } = await supabase
                .from('boards')
                .insert([{ name, owner_id: userId }])
                .select()
                .single()

            if (error) {
                console.error('Erro detalhado ao criar quadro:', error)
                throw error
            }

            set((state) => ({ boards: [data, ...state.boards] }))
            return data
        } catch (error: any) {
            alert('Erro ao criar quadro: ' + (error.message || 'Erro desconhecido'))
            return null
        }
    },
}))
