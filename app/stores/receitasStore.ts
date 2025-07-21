import { create } from 'zustand'
import { supabase, handleSupabaseError } from '@/app/lib/supabase'
import { Database } from '@/app/lib/database.types'

interface Ingrediente {
  nome: string
  quantidade: number
  unidade: string
}

export interface Receita {
  id: string
  nome: string
  descricao: string
  categorias: string[]
  tags: string[]
  tempoPreparo: number
  porcoes: number
  calorias: string
  imagem: string
  ingredientes: Ingrediente[]
  passos: string[]
  created_at?: string
  updated_at?: string
}

interface ReceitasStore {
  receitas: Receita[]
  favoritos: string[]
  loading: boolean
  error: string | null
  
  // Actions
  carregarReceitas: () => Promise<void>
  adicionarReceita: (receita: Omit<Receita, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  atualizarReceita: (receita: Receita) => Promise<void>
  removerReceita: (id: string) => Promise<void>
  obterReceitaPorId: (id: string) => Receita | undefined
  
  // Favoritos
  carregarFavoritos: () => Promise<void>
  alternarFavorito: (receitaId: string) => Promise<void>
  
  // Utilities
  clearError: () => void
}

const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')
  return user.id
}

export const useReceitasStore = create<ReceitasStore>()((set, get) => ({
  receitas: [],
  favoritos: [],
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  carregarReceitas: async () => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('receitas')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      const receitas: Receita[] = (data || []).map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        categorias: item.categorias,
        tags: item.tags,
        tempoPreparo: item.tempo_preparo,
        porcoes: item.porcoes,
        calorias: item.calorias,
        imagem: item.imagem,
        ingredientes: item.ingredientes as Ingrediente[],
        passos: item.passos,
        created_at: item.created_at,
        updated_at: item.updated_at
      }))
      
      set({ receitas, loading: false })
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao carregar receitas', loading: false })
    }
  },

  adicionarReceita: async (receitaData) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('receitas')
        .insert({
          user_id: userId,
          nome: receitaData.nome,
          descricao: receitaData.descricao,
          categorias: receitaData.categorias,
          tags: receitaData.tags,
          tempo_preparo: receitaData.tempoPreparo,
          porcoes: receitaData.porcoes,
          calorias: receitaData.calorias,
          imagem: receitaData.imagem,
          ingredientes: receitaData.ingredientes,
          passos: receitaData.passos
        })
        .select()
        .single()
      
      if (error) throw error
      
      const novaReceita: Receita = {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        categorias: data.categorias,
        tags: data.tags,
        tempoPreparo: data.tempo_preparo,
        porcoes: data.porcoes,
        calorias: data.calorias,
        imagem: data.imagem,
        ingredientes: data.ingredientes as Ingrediente[],
        passos: data.passos,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      set(state => ({
        receitas: [novaReceita, ...state.receitas],
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao adicionar receita', loading: false })
    }
  },

  atualizarReceita: async (receita) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('receitas')
        .update({
          nome: receita.nome,
          descricao: receita.descricao,
          categorias: receita.categorias,
          tags: receita.tags,
          tempo_preparo: receita.tempoPreparo,
          porcoes: receita.porcoes,
          calorias: receita.calorias,
          imagem: receita.imagem,
          ingredientes: receita.ingredientes,
          passos: receita.passos
        })
        .eq('id', receita.id)
        .eq('user_id', userId)
        .select()
        .single()
      
      if (error) throw error
      
      const receitaAtualizada: Receita = {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao,
        categorias: data.categorias,
        tags: data.tags,
        tempoPreparo: data.tempo_preparo,
        porcoes: data.porcoes,
        calorias: data.calorias,
        imagem: data.imagem,
        ingredientes: data.ingredientes as Ingrediente[],
        passos: data.passos,
        created_at: data.created_at,
        updated_at: data.updated_at
      }
      
      set(state => ({
        receitas: state.receitas.map(r => r.id === receita.id ? receitaAtualizada : r),
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao atualizar receita', loading: false })
    }
  },

  removerReceita: async (id) => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      
      const { error } = await supabase
        .from('receitas')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
      
      if (error) throw error
      
      set(state => ({
        receitas: state.receitas.filter(r => r.id !== id),
        loading: false
      }))
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao remover receita', loading: false })
    }
  },

  obterReceitaPorId: (id) => {
    return get().receitas.find(r => r.id === id)
  },

  carregarFavoritos: async () => {
    try {
      const userId = await getUserId()
      
      const { data, error } = await supabase
        .from('favoritos')
        .select('receita_id')
        .eq('user_id', userId)
      
      if (error) throw error
      
      const favoritos = (data || []).map(item => item.receita_id)
      set({ favoritos })
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao carregar favoritos' })
    }
  },

  alternarFavorito: async (receitaId) => {
    try {
      const userId = await getUserId()
      const { favoritos } = get()
      
      if (favoritos.includes(receitaId)) {
        // Remove dos favoritos
        const { error } = await supabase
          .from('favoritos')
          .delete()
          .eq('user_id', userId)
          .eq('receita_id', receitaId)
        
        if (error) throw error
        
        set(state => ({
          favoritos: state.favoritos.filter(id => id !== receitaId)
        }))
      } else {
        // Adiciona aos favoritos
        const { error } = await supabase
          .from('favoritos')
          .insert({ user_id: userId, receita_id: receitaId })
        
        if (error) throw error
        
        set(state => ({
          favoritos: [...state.favoritos, receitaId]
        }))
      }
    } catch (error) {
      handleSupabaseError(error)
      set({ error: 'Erro ao alterar favorito' })
    }
  }
}))
