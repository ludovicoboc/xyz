import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

// Tipos de banco de dados
type HiperfocoRow = Database['public']['Tables']['hiperfocos']['Row']
type TarefaHiperfocoRow = Database['public']['Tables']['tarefas_hiperfoco']['Row']
type SubtarefaHiperfocoRow = Database['public']['Tables']['subtarefas_hiperfoco']['Row']
type SessaoAlternanciaRow = Database['public']['Tables']['sessoes_alternancia']['Row']

// Tipos da aplicação
export type Tarefa = {
  id: string
  texto: string
  concluida: boolean
  cor?: string
  ordem: number
}

export type Hiperfoco = {
  id: string
  titulo: string
  descricao?: string
  tarefas: Tarefa[]
  subTarefas: Record<string, Tarefa[]> // Id da tarefa pai -> lista de sub-tarefas
  cor: string
  dataCriacao: string
  tempoLimite?: number // em minutos, opcional
}

export type SessaoAlternancia = {
  id: string
  titulo: string
  hiperfocoAtual: string | null // ID do hiperfoco ativo
  hiperfocoAnterior: string | null // ID do hiperfoco anterior
  tempoInicio: string
  duracaoEstimada: number // em minutos
  concluida: boolean
}

type HiperfocosState = {
  // Estado
  hiperfocos: Hiperfoco[]
  sessoes: SessaoAlternancia[]
  loading: boolean
  error: string | null
  
  // Ações
  carregarHiperfocos: () => Promise<void>
  carregarSessoes: () => Promise<void>
  clearError: () => void
  
  // Hiperfocos
  adicionarHiperfoco: (titulo: string, descricao: string, cor: string, tempoLimite?: number) => Promise<string>
  atualizarHiperfoco: (id: string, titulo: string, descricao: string, cor: string, tempoLimite?: number) => Promise<void>
  removerHiperfoco: (id: string) => Promise<void>
  
  // Tarefas
  adicionarTarefa: (hiperfocoId: string, texto: string) => Promise<string>
  atualizarTarefa: (hiperfocoId: string, tarefaId: string, texto: string) => Promise<void>
  toggleTarefaConcluida: (hiperfocoId: string, tarefaId: string) => Promise<void>
  removerTarefa: (hiperfocoId: string, tarefaId: string) => Promise<void>
  
  // Sub-tarefas
  adicionarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, texto: string) => Promise<string>
  atualizarSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string, texto: string) => Promise<void>
  toggleSubTarefaConcluida: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>
  removerSubTarefa: (hiperfocoId: string, tarefaPaiId: string, subTarefaId: string) => Promise<void>
  
  // Alternância
  adicionarSessao: (titulo: string, hiperfocoId: string, duracaoEstimada: number) => Promise<string>
  atualizarSessao: (id: string, titulo: string, hiperfocoId: string, duracaoEstimada: number) => Promise<void>
  concluirSessao: (id: string) => Promise<void>
  removerSessao: (id: string) => Promise<void>
  alternarHiperfoco: (sessaoId: string, novoHiperfocoId: string) => Promise<void>
}

// Cores predefinidas para hiperfocos
export const CORES_HIPERFOCOS = [
  '#FF5252', // Vermelho
  '#4CAF50', // Verde
  '#2196F3', // Azul
  '#FF9800', // Laranja
  '#9C27B0', // Roxo
  '#795548', // Marrom
  '#607D8B'  // Azul acinzentado
]

// Funções auxiliares
const mapHiperfocoRowToHiperfoco = async (hiperfocoRow: HiperfocoRow): Promise<Hiperfoco> => {
  const { data: user } = await supabase.auth.getUser()
  if (!user.user) throw new Error('Usuário não autenticado')

  // Buscar tarefas do hiperfoco
  const { data: tarefasData, error: tarefasError } = await supabase
    .from('tarefas_hiperfoco')
    .select('*')
    .eq('hiperfoco_id', hiperfocoRow.id)
    .eq('user_id', user.user.id)
    .order('ordem')

  if (tarefasError) throw tarefasError

  const tarefas: Tarefa[] = tarefasData.map(t => ({
    id: t.id,
    texto: t.texto,
    concluida: t.completada,
    cor: t.cor || undefined,
    ordem: t.ordem
  }))

  // Buscar subtarefas para cada tarefa
  const subTarefas: Record<string, Tarefa[]> = {}
  
  for (const tarefa of tarefas) {
    const { data: subtarefasData, error: subtarefasError } = await supabase
      .from('subtarefas_hiperfoco')
      .select('*')
      .eq('tarefa_pai_id', tarefa.id)
      .eq('user_id', user.user.id)
      .order('ordem')

    if (subtarefasError) throw subtarefasError

    subTarefas[tarefa.id] = subtarefasData.map(st => ({
      id: st.id,
      texto: st.texto,
      concluida: st.completada,
      cor: st.cor || undefined,
      ordem: st.ordem
    }))
  }

  return {
    id: hiperfocoRow.id,
    titulo: hiperfocoRow.titulo,
    descricao: hiperfocoRow.descricao,
    tarefas,
    subTarefas,
    cor: hiperfocoRow.cor,
    dataCriacao: hiperfocoRow.created_at,
    tempoLimite: hiperfocoRow.tempo_limite || undefined
  }
}

const mapSessaoRowToSessao = (sessaoRow: SessaoAlternanciaRow): SessaoAlternancia => ({
  id: sessaoRow.id,
  titulo: sessaoRow.titulo,
  hiperfocoAtual: sessaoRow.hiperfoco_atual_id || null,
  hiperfocoAnterior: sessaoRow.hiperfoco_anterior_id || null,
  tempoInicio: sessaoRow.tempo_inicio,
  duracaoEstimada: sessaoRow.duracao_estimada,
  concluida: sessaoRow.completada
})

export const useHiperfocosStore = create<HiperfocosState>()((set, get) => ({
  // Estado inicial
  hiperfocos: [],
  sessoes: [],
  loading: false,
  error: null,
  
  // Ações básicas
  clearError: () => set({ error: null }),
  
  // Carregar dados
  carregarHiperfocos: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('hiperfocos')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const hiperfocos = await Promise.all(
        data.map(mapHiperfocoRowToHiperfoco)
      )

      set({ hiperfocos, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar hiperfocos',
        loading: false 
      })
    }
  },

  carregarSessoes: async () => {
    set({ loading: true, error: null })
    
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('sessoes_alternancia')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const sessoes = data.map(mapSessaoRowToSessao)
      set({ sessoes, loading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erro ao carregar sessões',
        loading: false 
      })
    }
  },

  // Ações para hiperfocos
  adicionarHiperfoco: async (titulo, descricao, cor, tempoLimite) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('hiperfocos')
        .insert({
          user_id: user.user.id,
          titulo,
          descricao,
          cor,
          tempo_limite: tempoLimite
        })
        .select()
        .single()

      if (error) throw error

      const novoHiperfoco = await mapHiperfocoRowToHiperfoco(data)
      set((state) => ({
        hiperfocos: [novoHiperfoco, ...state.hiperfocos]
      }))

      return data.id
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar hiperfoco' })
      throw error
    }
  },

  atualizarHiperfoco: async (id, titulo, descricao, cor, tempoLimite) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('hiperfocos')
        .update({
          titulo,
          descricao,
          cor,
          tempo_limite: tempoLimite
        })
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single()

      if (error) throw error

      const hiperfocoAtualizado = await mapHiperfocoRowToHiperfoco(data)
      set((state) => ({
        hiperfocos: state.hiperfocos.map((h) =>
          h.id === id ? hiperfocoAtualizado : h
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar hiperfoco' })
      throw error
    }
  },

  removerHiperfoco: async (id) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('hiperfocos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id)

      if (error) throw error

      set((state) => ({
        hiperfocos: state.hiperfocos.filter((h) => h.id !== id),
        sessoes: state.sessoes.filter(
          (s) => s.hiperfocoAtual !== id && s.hiperfocoAnterior !== id
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover hiperfoco' })
      throw error
    }
  },

  // Ações para tarefas
  adicionarTarefa: async (hiperfocoId, texto) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      // Buscar próxima ordem
      const { data: existingTasks } = await supabase
        .from('tarefas_hiperfoco')
        .select('ordem')
        .eq('hiperfoco_id', hiperfocoId)
        .eq('user_id', user.user.id)
        .order('ordem', { ascending: false })
        .limit(1)

      const nextOrder = existingTasks && existingTasks.length > 0 
        ? existingTasks[0].ordem + 1 
        : 0

      const { data, error } = await supabase
        .from('tarefas_hiperfoco')
        .insert({
          hiperfoco_id: hiperfocoId,
          user_id: user.user.id,
          texto,
          ordem: nextOrder
        })
        .select()
        .single()

      if (error) throw error

      // Atualizar estado local
      await get().carregarHiperfocos()
      return data.id
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar tarefa' })
      throw error
    }
  },

  atualizarTarefa: async (hiperfocoId, tarefaId, texto) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('tarefas_hiperfoco')
        .update({ texto })
        .eq('id', tarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar tarefa' })
      throw error
    }
  },

  toggleTarefaConcluida: async (hiperfocoId, tarefaId) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      // Buscar estado atual
      const { data: currentTask, error: fetchError } = await supabase
        .from('tarefas_hiperfoco')
        .select('completada')
        .eq('id', tarefaId)
        .eq('user_id', user.user.id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('tarefas_hiperfoco')
        .update({ completada: !currentTask.completada })
        .eq('id', tarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar tarefa' })
      throw error
    }
  },

  removerTarefa: async (hiperfocoId, tarefaId) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('tarefas_hiperfoco')
        .delete()
        .eq('id', tarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover tarefa' })
      throw error
    }
  },

  // Ações para sub-tarefas
  adicionarSubTarefa: async (hiperfocoId, tarefaPaiId, texto) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      // Buscar próxima ordem
      const { data: existingSubtasks } = await supabase
        .from('subtarefas_hiperfoco')
        .select('ordem')
        .eq('tarefa_pai_id', tarefaPaiId)
        .eq('user_id', user.user.id)
        .order('ordem', { ascending: false })
        .limit(1)

      const nextOrder = existingSubtasks && existingSubtasks.length > 0 
        ? existingSubtasks[0].ordem + 1 
        : 0

      const { data, error } = await supabase
        .from('subtarefas_hiperfoco')
        .insert({
          tarefa_pai_id: tarefaPaiId,
          user_id: user.user.id,
          texto,
          ordem: nextOrder
        })
        .select()
        .single()

      if (error) throw error

      await get().carregarHiperfocos()
      return data.id
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar subtarefa' })
      throw error
    }
  },

  atualizarSubTarefa: async (hiperfocoId, tarefaPaiId, subTarefaId, texto) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('subtarefas_hiperfoco')
        .update({ texto })
        .eq('id', subTarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar subtarefa' })
      throw error
    }
  },

  toggleSubTarefaConcluida: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      // Buscar estado atual
      const { data: currentSubtask, error: fetchError } = await supabase
        .from('subtarefas_hiperfoco')
        .select('completada')
        .eq('id', subTarefaId)
        .eq('user_id', user.user.id)
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('subtarefas_hiperfoco')
        .update({ completada: !currentSubtask.completada })
        .eq('id', subTarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar subtarefa' })
      throw error
    }
  },

  removerSubTarefa: async (hiperfocoId, tarefaPaiId, subTarefaId) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('subtarefas_hiperfoco')
        .delete()
        .eq('id', subTarefaId)
        .eq('user_id', user.user.id)

      if (error) throw error

      await get().carregarHiperfocos()
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover subtarefa' })
      throw error
    }
  },

  // Ações para sessões de alternância
  adicionarSessao: async (titulo, hiperfocoId, duracaoEstimada) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('sessoes_alternancia')
        .insert({
          user_id: user.user.id,
          titulo,
          hiperfoco_atual_id: hiperfocoId,
          duracao_estimada: duracaoEstimada
        })
        .select()
        .single()

      if (error) throw error

      const novaSessao = mapSessaoRowToSessao(data)
      set((state) => ({
        sessoes: [novaSessao, ...state.sessoes]
      }))

      return data.id
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao adicionar sessão' })
      throw error
    }
  },

  atualizarSessao: async (id, titulo, hiperfocoId, duracaoEstimada) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('sessoes_alternancia')
        .update({
          titulo,
          hiperfoco_atual_id: hiperfocoId,
          duracao_estimada: duracaoEstimada
        })
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single()

      if (error) throw error

      const sessaoAtualizada = mapSessaoRowToSessao(data)
      set((state) => ({
        sessoes: state.sessoes.map((s) =>
          s.id === id ? sessaoAtualizada : s
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao atualizar sessão' })
      throw error
    }
  },

  concluirSessao: async (id) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { data, error } = await supabase
        .from('sessoes_alternancia')
        .update({ completada: true })
        .eq('id', id)
        .eq('user_id', user.user.id)
        .select()
        .single()

      if (error) throw error

      const sessaoAtualizada = mapSessaoRowToSessao(data)
      set((state) => ({
        sessoes: state.sessoes.map((s) =>
          s.id === id ? sessaoAtualizada : s
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao concluir sessão' })
      throw error
    }
  },

  removerSessao: async (id) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('sessoes_alternancia')
        .delete()
        .eq('id', id)
        .eq('user_id', user.user.id)

      if (error) throw error

      set((state) => ({
        sessoes: state.sessoes.filter((s) => s.id !== id)
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao remover sessão' })
      throw error
    }
  },

  alternarHiperfoco: async (sessaoId, novoHiperfocoId) => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error('Usuário não autenticado')

      // Buscar sessão atual
      const { data: sessaoAtual, error: fetchError } = await supabase
        .from('sessoes_alternancia')
        .select('hiperfoco_atual_id')
        .eq('id', sessaoId)
        .eq('user_id', user.user.id)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await supabase
        .from('sessoes_alternancia')
        .update({
          hiperfoco_anterior_id: sessaoAtual.hiperfoco_atual_id,
          hiperfoco_atual_id: novoHiperfocoId,
          tempo_inicio: new Date().toISOString()
        })
        .eq('id', sessaoId)
        .eq('user_id', user.user.id)
        .select()
        .single()

      if (error) throw error

      const sessaoAtualizada = mapSessaoRowToSessao(data)
      set((state) => ({
        sessoes: state.sessoes.map((s) =>
          s.id === sessaoId ? sessaoAtualizada : s
        )
      }))
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao alternar hiperfoco' })
      throw error
    }
  }
}))
