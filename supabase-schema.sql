-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create usuarios table
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255),
    avatar_url TEXT
);

-- Create receitas table
CREATE TABLE IF NOT EXISTS public.receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categorias TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    tempo_preparo INTEGER NOT NULL,
    porcoes INTEGER NOT NULL,
    calorias VARCHAR(50),
    imagem TEXT,
    ingredientes JSONB NOT NULL,
    passos TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create favoritos table
CREATE TABLE IF NOT EXISTS public.favoritos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    receita_id UUID REFERENCES public.receitas(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, receita_id)
);

-- Create registros_humor table
CREATE TABLE IF NOT EXISTS public.registros_humor (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    humor VARCHAR(10) CHECK (humor IN ('otimo', 'bom', 'neutro', 'baixo', 'ruim')),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data)
);

-- Create sessoes_estudo table
CREATE TABLE IF NOT EXISTS public.sessoes_estudo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    inicio TIME NOT NULL,
    fim TIME NOT NULL,
    materia VARCHAR(255) NOT NULL,
    tecnica VARCHAR(20) CHECK (tecnica IN ('pomodoro', 'blocos', 'livre')),
    produtividade INTEGER CHECK (produtividade BETWEEN 1 AND 5),
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create registros_hidratacao table
CREATE TABLE IF NOT EXISTS public.registros_hidratacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    data DATE NOT NULL,
    quantidade INTEGER NOT NULL,
    hora TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create concursos table
CREATE TABLE IF NOT EXISTS public.concursos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    data_prova DATE,
    status VARCHAR(20) CHECK (status IN ('estudando', 'aguardando', 'finalizado')) DEFAULT 'estudando',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questoes table
CREATE TABLE IF NOT EXISTS public.questoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    concurso_id UUID REFERENCES public.concursos(id) ON DELETE SET NULL,
    enunciado TEXT NOT NULL,
    alternativas JSONB NOT NULL,
    resposta_correta VARCHAR(10) NOT NULL,
    explicacao TEXT,
    tags TEXT[] DEFAULT '{}',
    dificuldade VARCHAR(10) CHECK (dificuldade IN ('facil', 'medio', 'dificil')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prioridades table
CREATE TABLE IF NOT EXISTS public.prioridades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    prioridade VARCHAR(10) CHECK (prioridade IN ('alta', 'media', 'baixa')) DEFAULT 'media',
    completada BOOLEAN DEFAULT FALSE,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_conclusao TIMESTAMP WITH TIME ZONE
);

-- Create RLS (Row Level Security) policies
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favoritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_humor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_estudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_hidratacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prioridades ENABLE ROW LEVEL SECURITY;

-- Create policies for usuarios table
CREATE POLICY "Users can view own profile" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for receitas table
CREATE POLICY "Users can view own receitas" ON public.receitas
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own receitas" ON public.receitas
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own receitas" ON public.receitas
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own receitas" ON public.receitas
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for favoritos table
CREATE POLICY "Users can view own favoritos" ON public.favoritos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favoritos" ON public.favoritos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favoritos" ON public.favoritos
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for registros_humor table
CREATE POLICY "Users can view own registros_humor" ON public.registros_humor
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registros_humor" ON public.registros_humor
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registros_humor" ON public.registros_humor
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own registros_humor" ON public.registros_humor
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for sessoes_estudo table
CREATE POLICY "Users can view own sessoes_estudo" ON public.sessoes_estudo
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessoes_estudo" ON public.sessoes_estudo
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessoes_estudo" ON public.sessoes_estudo
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessoes_estudo" ON public.sessoes_estudo
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for registros_hidratacao table
CREATE POLICY "Users can view own registros_hidratacao" ON public.registros_hidratacao
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own registros_hidratacao" ON public.registros_hidratacao
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own registros_hidratacao" ON public.registros_hidratacao
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own registros_hidratacao" ON public.registros_hidratacao
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for concursos table
CREATE POLICY "Users can view own concursos" ON public.concursos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own concursos" ON public.concursos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own concursos" ON public.concursos
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own concursos" ON public.concursos
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for questoes table
CREATE POLICY "Users can view own questoes" ON public.questoes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own questoes" ON public.questoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own questoes" ON public.questoes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own questoes" ON public.questoes
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for prioridades table
CREATE POLICY "Users can view own prioridades" ON public.prioridades
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own prioridades" ON public.prioridades
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own prioridades" ON public.prioridades
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own prioridades" ON public.prioridades
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_categorias ON public.receitas USING GIN(categorias);
CREATE INDEX IF NOT EXISTS idx_receitas_tags ON public.receitas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_favoritos_user_id ON public.favoritos(user_id);
CREATE INDEX IF NOT EXISTS idx_registros_humor_user_id_data ON public.registros_humor(user_id, data);
CREATE INDEX IF NOT EXISTS idx_sessoes_estudo_user_id_data ON public.sessoes_estudo(user_id, data);
CREATE INDEX IF NOT EXISTS idx_registros_hidratacao_user_id_data ON public.registros_hidratacao(user_id, data);
CREATE INDEX IF NOT EXISTS idx_concursos_user_id ON public.concursos(user_id);
CREATE INDEX IF NOT EXISTS idx_questoes_user_id ON public.questoes(user_id);
CREATE INDEX IF NOT EXISTS idx_questoes_concurso_id ON public.questoes(concurso_id);
CREATE INDEX IF NOT EXISTS idx_prioridades_user_id ON public.prioridades(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON public.receitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_concursos_updated_at BEFORE UPDATE ON public.concursos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HIPERFOCOS TABLES
-- =============================================

-- Tabela de hiperfocos
CREATE TABLE public.hiperfocos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    cor TEXT NOT NULL,
    tempo_limite INTEGER, -- em minutos, opcional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tarefas dos hiperfocos
CREATE TABLE public.tarefas_hiperfoco (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hiperfoco_id UUID REFERENCES public.hiperfocos(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    texto TEXT NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    cor TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de subtarefas
CREATE TABLE public.subtarefas_hiperfoco (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tarefa_pai_id UUID REFERENCES public.tarefas_hiperfoco(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    texto TEXT NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    cor TEXT,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões de alternância
CREATE TABLE public.sessoes_alternancia (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    titulo TEXT NOT NULL,
    hiperfoco_atual_id UUID REFERENCES public.hiperfocos(id) ON DELETE SET NULL,
    hiperfoco_anterior_id UUID REFERENCES public.hiperfocos(id) ON DELETE SET NULL,
    tempo_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duracao_estimada INTEGER NOT NULL, -- em minutos
    completada BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.hiperfocos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas_hiperfoco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtarefas_hiperfoco ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessoes_alternancia ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hiperfocos
CREATE POLICY "Users can view own hiperfocos" ON public.hiperfocos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own hiperfocos" ON public.hiperfocos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own hiperfocos" ON public.hiperfocos
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own hiperfocos" ON public.hiperfocos
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for tarefas_hiperfoco
CREATE POLICY "Users can view own tarefas_hiperfoco" ON public.tarefas_hiperfoco
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tarefas_hiperfoco" ON public.tarefas_hiperfoco
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tarefas_hiperfoco" ON public.tarefas_hiperfoco
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tarefas_hiperfoco" ON public.tarefas_hiperfoco
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for subtarefas_hiperfoco
CREATE POLICY "Users can view own subtarefas_hiperfoco" ON public.subtarefas_hiperfoco
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subtarefas_hiperfoco" ON public.subtarefas_hiperfoco
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subtarefas_hiperfoco" ON public.subtarefas_hiperfoco
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subtarefas_hiperfoco" ON public.subtarefas_hiperfoco
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for sessoes_alternancia
CREATE POLICY "Users can view own sessoes_alternancia" ON public.sessoes_alternancia
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessoes_alternancia" ON public.sessoes_alternancia
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessoes_alternancia" ON public.sessoes_alternancia
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessoes_alternancia" ON public.sessoes_alternancia
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hiperfocos_user_id ON public.hiperfocos(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_hiperfoco_user_id ON public.tarefas_hiperfoco(user_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_hiperfoco_hiperfoco_id ON public.tarefas_hiperfoco(hiperfoco_id);
CREATE INDEX IF NOT EXISTS idx_subtarefas_hiperfoco_user_id ON public.subtarefas_hiperfoco(user_id);
CREATE INDEX IF NOT EXISTS idx_subtarefas_hiperfoco_tarefa_pai_id ON public.subtarefas_hiperfoco(tarefa_pai_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_alternancia_user_id ON public.sessoes_alternancia(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_hiperfocos_updated_at BEFORE UPDATE ON public.hiperfocos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tarefas_hiperfoco_updated_at BEFORE UPDATE ON public.tarefas_hiperfoco
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subtarefas_hiperfoco_updated_at BEFORE UPDATE ON public.subtarefas_hiperfoco
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessoes_alternancia_updated_at BEFORE UPDATE ON public.sessoes_alternancia
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();