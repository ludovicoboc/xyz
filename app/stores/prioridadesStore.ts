import { create } from 'zustand'
import { supabase, handleSupabaseError } from '@/app/lib/supabase'

export type Prioridade = {
  id: string
  titulo: string
  descricao?: string
  prioridade: 'alta' | 'media' | 'baixa'
  completada: boolean
  data_criacao: string
  data_conclusao?: string
  tipo?: 'geral' | 'concurso'
  origemId?: string
}

interface PrioridadesState {
  prioridades: Prioridade[]
  loading: boolean
  error: string | null
  
  // Actions
  carregarPrioridades: () => Promise<void>
  adicionarPrioridade: (prioridade: Omit<Prioridade, 'id' | 'data_criacao' | 'data_conclusao'>) => Promise<void>
  editarPrioridade: (id: string, dados: Partial<Pick<Prioridade, 'titulo' | 'descricao' | 'prioridade'>>) => Promise<void>
  removerPrioridade: (id: string) => Promise<void>
  toggleConcluida: (id: string) => Promise<void>
  
  // Utilities
  getHistoricoPorData: (data?: string) => Prioridade[]
  getDatasPrioridades: () => string[]
  clearError: () => void
}

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')
  return user.id
}

export const usePrioridadesStore = create<PrioridadesState>()((set, get) => ({
  prioridades: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  carregarPrioridades: async () => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('prioridades')
        .select('*')
        .eq('user_id', userId)
        .order('data_criacao', { ascending: false })
      
      if (error) throw error
      
      const prioridades: Prioridade[] = (data || []).map(item => ({
        id: item.id,
        titulo: item.titulo,
        descricao: item.descricao,
        prioridade: item.prioridade as 'alta' | 'media' | 'baixa',
        completada: item.completada,
        data_criacao: item.data_criacao,
        data_conclusao: item.data_conclusao
      }))
      
      set({ prioridades, loading: false })
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao carregar prioridades', loading: false })
    }
  },

  adicionarPrioridade: async (novaPrioridade) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('prioridades')
        .insert({
          user_id: userId,
          titulo: novaPrioridade.titulo,
          descricao: novaPrioridade.descricao,
          prioridade: novaPrioridade.prioridade,
          completada: novaPrioridade.completada
        })
        .select()
        .single()
      
      if (error) throw error
      
      const prioridadeCompleta: Prioridade = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade as 'alta' | 'media' | 'baixa',
        completada: data.completada,
        data_criacao: data.data_criacao,
        data_conclusao: data.data_conclusao
      }
      
      set(state => ({
        prioridades: [prioridadeCompleta, ...state.prioridades],
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao adicionar prioridade', loading: false })
    }
  },

  editarPrioridade: async (id, dados) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('prioridades')
        .update(dados)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      const prioridadeAtualizada: Prioridade = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade as 'alta' | 'media' | 'baixa',
        completada: data.completada,
        data_criacao: data.data_criacao,
        data_conclusao: data.data_conclusao
      }
      
      set(state => ({
        prioridades: state.prioridades.map(p => p.id === id ? prioridadeAtualizada : p),
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao editar prioridade', loading: false })
    }
  },
  
  removerPrioridade: async (id) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { error } = await supabase
        .from('prioridades')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      if (error) throw error
      
      set(state => ({
        prioridades: state.prioridades.filter(p => p.id !== id),
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao remover prioridade', loading: false })
    }
  },
  
  toggleConcluida: async (id) => {
    try {
      const userId = await getUserId()
      const prioridade = get().prioridades.find(p => p.id === id)
      if (!prioridade) return
      
      const novoStatus = !prioridade.completada
      const dataAtual = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('prioridades')
        .update({
          completada: novoStatus,
          data_conclusao: novoStatus ? dataAtual : null
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      const prioridadeAtualizada: Prioridade = {
        id: data.id,
        titulo: data.titulo,
        descricao: data.descricao,
        prioridade: data.prioridade as 'alta' | 'media' | 'baixa',
        completada: data.completada,
        data_criacao: data.data_criacao,
        data_conclusao: data.data_conclusao
      }
      
      set(state => ({
        prioridades: state.prioridades.map(p => p.id === id ? prioridadeAtualizada : p)
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao alterar status da prioridade' })
    }
  },
  
  getHistoricoPorData: (data) => {
    const dataFiltro = data || new Date().toISOString().split('T')[0]
    return get().prioridades.filter(p => p.data_criacao.split('T')[0] === dataFiltro)
  },
  
  getDatasPrioridades: () => {
    const datas = get().prioridades.map(p => p.data_criacao.split('T')[0])
    return Array.from(new Set(datas)).sort().reverse()
  }
}))
