-- Execute este script no SQL Editor do Supabase para criar as tabelas faltantes e políticas de segurança
-- Baseado na estrutura solicitada

-- 1. Tabela de Contatos (Clientes/Pacientes) - Essencial para relacionar com agendamentos
CREATE TABLE IF NOT EXISTS public.clinica_contatos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID, -- Referencia o dono da clinica ou sistema
    nome TEXT NOT NULL,
    telefone TEXT,
    email TEXT,
    data_nascimento DATE,
    cpf TEXT,
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de Anamneses (Fichas médicas/histórico preenchido)
CREATE TABLE IF NOT EXISTS public.clinica_anamneses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contato_id UUID REFERENCES public.clinica_contatos(id),
    professional_id UUID REFERENCES public.clinica_profissionais(id),
    titulo TEXT,
    respostas JSONB, -- Armazena as perguntas e respostas flexíveis
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Informações da Clínica
CREATE TABLE IF NOT EXISTS public.clinica_infos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_fantasia TEXT,
    endereco TEXT,
    telefone TEXT,
    logo_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Serviços
CREATE TABLE IF NOT EXISTS public.clinica_servicos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.clinica_profissionais(id),
    nome TEXT NOT NULL,
    duracao_minutos INTEGER DEFAULT 30,
    preco NUMERIC DEFAULT 0,
    descricao TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Disponibilidade (Horários)
CREATE TABLE IF NOT EXISTS public.clinica_horarios (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.clinica_profissionais(id),
    dia_semana INTEGER NOT NULL, -- 0 = Domingo, 1 = Segunda, etc.
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(professional_id, dia_semana)
);

-- 6. Tabela de Modelo de Anamnese (Configuração da ficha do profissional)
CREATE TABLE IF NOT EXISTS public.clinica_modelos_anamnese (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professional_id UUID REFERENCES public.clinica_profissionais(id),
    titulo TEXT DEFAULT 'Ficha Padrão',
    perguntas JSONB, -- Array de strings ou objetos definindo as perguntas
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Atualizar Tabela de Agendamentos (Garantir relacionamentos)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinica_agendamentos' AND column_name = 'cor') THEN
        ALTER TABLE public.clinica_agendamentos ADD COLUMN cor TEXT DEFAULT 'blue';
    END IF;
END $$;

-- 8. Row Level Security (RLS)
ALTER TABLE public.clinica_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinica_modelos_anamnese ENABLE ROW LEVEL SECURITY;

-- Políticas (O profissional vê apenas seus dados)

CREATE POLICY "Profissionais veem seu proprio perfil" ON public.clinica_profissionais
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Profissionais veem seus agendamentos" ON public.clinica_agendamentos
    FOR SELECT USING (
        professional_id IN (SELECT id FROM public.clinica_profissionais WHERE user_id = auth.uid())
    );

CREATE POLICY "Profissionais veem suas comissoes" ON public.clinica_commissions
    FOR SELECT USING (
        professional_id IN (SELECT id FROM public.clinica_profissionais WHERE user_id = auth.uid())
    );

CREATE POLICY "Profissionais gerenciam seus servicos" ON public.clinica_servicos
    FOR ALL USING (
        professional_id IN (SELECT id FROM public.clinica_profissionais WHERE user_id = auth.uid())
    );

CREATE POLICY "Profissionais gerenciam seus horarios" ON public.clinica_horarios
    FOR ALL USING (
        professional_id IN (SELECT id FROM public.clinica_profissionais WHERE user_id = auth.uid())
    );

CREATE POLICY "Profissionais gerenciam seus modelos" ON public.clinica_modelos_anamnese
    FOR ALL USING (
        professional_id IN (SELECT id FROM public.clinica_profissionais WHERE user_id = auth.uid())
    );
