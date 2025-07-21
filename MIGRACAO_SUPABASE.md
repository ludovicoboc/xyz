# Migração para Supabase - StayFocus

## Visão Geral

Esta migração remove completamente a dependência do localStorage e migra toda a persistência de dados para o Supabase, incluindo autenticação de usuários.

## O que foi Migrado

### 1. Configuração Base
- ✅ Instalação do `@supabase/supabase-js`
- ✅ Configuração do cliente Supabase (`app/lib/supabase.ts`)
- ✅ Tipos TypeScript para o banco (`app/lib/database.types.ts`)
- ✅ Schema SQL completo (`supabase-schema.sql`)

### 2. Autenticação
- ✅ Hook `useAuth` para gerenciar estado de autenticação
- ✅ Componente `AuthGuard` para proteger rotas
- ✅ Formulário de login/cadastro com Google OAuth
- ✅ Página de callback de autenticação
- ✅ Integração no layout principal

### 3. Stores Migradas
- ✅ `receitasStore.ts` - Migrada completamente
- ✅ `prioridadesStore.ts` - Migrada completamente
- 🔄 Outras stores precisam ser migradas seguindo o mesmo padrão

### 4. Componentes Refatorados
- ✅ `ListaReceitas.tsx` - Atualizada para usar dados async
- 🔄 Outros componentes precisam ser atualizados

## Configuração Necessária

### 1. Variáveis de Ambiente
Copie `.env.local.example` para `.env.local` e configure:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_projeto_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_supabase

# Google OAuth (opcional)
GOOGLE_CLIENT_ID=seu_client_id_google
GOOGLE_CLIENT_SECRET=seu_client_secret_google
```

### 2. Configuração do Banco
Execute o script `supabase-schema.sql` no seu projeto Supabase:

1. Acesse o painel do Supabase
2. Vá para "SQL Editor"
3. Cole e execute o conteúdo de `supabase-schema.sql`

### 3. Configuração de Autenticação
No painel do Supabase:

1. Vá para "Authentication" > "Providers"
2. Configure o Google OAuth se necessário
3. Adicione a URL de callback: `https://seudominio.com/auth/callback`

## Padrão de Migração de Stores

### Estrutura Antiga (localStorage)
```typescript
export const useStore = create()(
  persist(
    (set, get) => ({
      data: [],
      addItem: (item) => set(state => ({ data: [...state.data, item] }))
    }),
    { name: 'storage-key' }
  )
)
```

### Estrutura Nova (Supabase)
```typescript
export const useStore = create()((set, get) => ({
  data: [],
  loading: false,
  error: null,
  
  loadData: async () => {
    try {
      set({ loading: true, error: null })
      const userId = await getUserId()
      const { data, error } = await supabase.from('table').select('*').eq('user_id', userId)
      if (error) throw error
      set({ data, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
    }
  },
  
  addItem: async (item) => {
    try {
      const userId = await getUserId()
      const { data, error } = await supabase.from('table').insert({ ...item, user_id: userId }).select().single()
      if (error) throw error
      set(state => ({ data: [...state.data, data] }))
    } catch (error) {
      set({ error: error.message })
    }
  }
}))
```

## Próximos Passos

### 1. Migrar Stores Restantes
Aplicar o mesmo padrão para:
- `alimentacaoStore.ts`
- `estudosStore.ts`
- `saudeStore.ts`
- `concursosStore.ts`
- `financasStore.ts`
- `hiperfocosStore.ts`
- `sonoStore.ts`

### 2. Atualizar Componentes
Refatorar componentes para:
- Usar dados assíncronos
- Mostrar estados de loading
- Tratar erros apropriadamente
- Carregar dados quando necessário

### 3. Migração de Dados Existentes
Se houver dados no localStorage:
1. Criar scripts de migração
2. Exportar dados do localStorage
3. Importar para Supabase via API

### 4. Testes
- Testar autenticação
- Testar operações CRUD
- Testar políticas RLS
- Testar performance

## Benefícios da Migração

1. **Multi-dispositivo**: Dados sincronizados entre dispositivos
2. **Backup automático**: Dados seguros na nuvem
3. **Colaboração**: Possibilidade de compartilhar dados
4. **Performance**: Queries otimizadas e índices
5. **Segurança**: RLS (Row Level Security) implementada
6. **Escalabilidade**: Suporta mais usuários e dados

## Considerações

1. **Conectividade**: App agora requer internet
2. **Latência**: Operações podem ser mais lentas que localStorage
3. **Custos**: Supabase tem limites no plano gratuito
4. **Complexidade**: Código mais complexo com async/await

## Suporte

Para dúvidas sobre a migração, consulte:
- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)