export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          created_at: string
          email: string
          nome?: string
          avatar_url?: string
        }
        Insert: {
          id: string
          created_at?: string
          email: string
          nome?: string
          avatar_url?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          nome?: string
          avatar_url?: string
        }
      }
      receitas: {
        Row: {
          id: string
          user_id: string
          nome: string
          descricao: string
          categorias: string[]
          tags: string[]
          tempo_preparo: number
          porcoes: number
          calorias: string
          imagem: string
          ingredientes: Json
          passos: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          descricao: string
          categorias: string[]
          tags: string[]
          tempo_preparo: number
          porcoes: number
          calorias: string
          imagem: string
          ingredientes: Json
          passos: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          descricao?: string
          categorias?: string[]
          tags?: string[]
          tempo_preparo?: number
          porcoes?: number
          calorias?: string
          imagem?: string
          ingredientes?: Json
          passos?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      favoritos: {
        Row: {
          id: string
          user_id: string
          receita_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          receita_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          receita_id?: string
          created_at?: string
        }
      }
      registros_humor: {
        Row: {
          id: string
          user_id: string
          data: string
          humor: 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'
          notas?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          humor: 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'
          notas?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          humor?: 'otimo' | 'bom' | 'neutro' | 'baixo' | 'ruim'
          notas?: string
          created_at?: string
        }
      }
      sessoes_estudo: {
        Row: {
          id: string
          user_id: string
          data: string
          inicio: string
          fim: string
          materia: string
          tecnica: 'pomodoro' | 'blocos' | 'livre'
          produtividade: number
          notas?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          inicio: string
          fim: string
          materia: string
          tecnica: 'pomodoro' | 'blocos' | 'livre'
          produtividade: number
          notas?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          inicio?: string
          fim?: string
          materia?: string
          tecnica?: 'pomodoro' | 'blocos' | 'livre'
          produtividade?: number
          notas?: string
          created_at?: string
        }
      }
      registros_hidratacao: {
        Row: {
          id: string
          user_id: string
          data: string
          quantidade: number
          hora: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          data: string
          quantidade: number
          hora: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          data?: string
          quantidade?: number
          hora?: string
          created_at?: string
        }
      }
      concursos: {
        Row: {
          id: string
          user_id: string
          nome: string
          data_prova?: string
          status: 'estudando' | 'aguardando' | 'finalizado'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          data_prova?: string
          status?: 'estudando' | 'aguardando' | 'finalizado'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          data_prova?: string
          status?: 'estudando' | 'aguardando' | 'finalizado'
          created_at?: string
          updated_at?: string
        }
      }
      questoes: {
        Row: {
          id: string
          user_id: string
          concurso_id?: string
          enunciado: string
          alternativas: Json
          resposta_correta: string
          explicacao?: string
          tags: string[]
          dificuldade: 'facil' | 'medio' | 'dificil'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          concurso_id?: string
          enunciado: string
          alternativas: Json
          resposta_correta: string
          explicacao?: string
          tags: string[]
          dificuldade: 'facil' | 'medio' | 'dificil'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          concurso_id?: string
          enunciado?: string
          alternativas?: Json
          resposta_correta?: string
          explicacao?: string
          tags?: string[]
          dificuldade?: 'facil' | 'medio' | 'dificil'
          created_at?: string
        }
      }
      prioridades: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao?: string
          prioridade: 'alta' | 'media' | 'baixa'
          completada: boolean
          data_criacao: string
          data_conclusao?: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          descricao?: string
          prioridade: 'alta' | 'media' | 'baixa'
          completada?: boolean
          data_criacao?: string
          data_conclusao?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          descricao?: string
          prioridade?: 'alta' | 'media' | 'baixa'
          completada?: boolean
          data_criacao?: string
          data_conclusao?: string
        }
      }
      hiperfocos: {
        Row: {
          id: string
          user_id: string
          titulo: string
          descricao?: string
          cor: string
          tempo_limite?: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          descricao?: string
          cor: string
          tempo_limite?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          descricao?: string
          cor?: string
          tempo_limite?: number
          created_at?: string
          updated_at?: string
        }
      }
      tarefas_hiperfoco: {
        Row: {
          id: string
          hiperfoco_id: string
          user_id: string
          texto: string
          completada: boolean
          cor?: string
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          hiperfoco_id: string
          user_id: string
          texto: string
          completada?: boolean
          cor?: string
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          hiperfoco_id?: string
          user_id?: string
          texto?: string
          completada?: boolean
          cor?: string
          ordem?: number
          created_at?: string
          updated_at?: string
        }
      }
      subtarefas_hiperfoco: {
        Row: {
          id: string
          tarefa_pai_id: string
          user_id: string
          texto: string
          completada: boolean
          cor?: string
          ordem: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tarefa_pai_id: string
          user_id: string
          texto: string
          completada?: boolean
          cor?: string
          ordem?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tarefa_pai_id?: string
          user_id?: string
          texto?: string
          completada?: boolean
          cor?: string
          ordem?: number
          created_at?: string
          updated_at?: string
        }
      }
      sessoes_alternancia: {
        Row: {
          id: string
          user_id: string
          titulo: string
          hiperfoco_atual_id?: string
          hiperfoco_anterior_id?: string
          tempo_inicio: string
          duracao_estimada: number
          completada: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          titulo: string
          hiperfoco_atual_id?: string
          hiperfoco_anterior_id?: string
          tempo_inicio?: string
          duracao_estimada: number
          completada?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          titulo?: string
          hiperfoco_atual_id?: string
          hiperfoco_anterior_id?: string
          tempo_inicio?: string
          duracao_estimada?: number
          completada?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}