# Guia de Implantação: Hub Conexão (Produção)

Este manual descreve o processo passo a passo para colocar a aplicação em produção utilizando **Vercel** e **Supabase**.

---

## 1. Preparação do Banco de Dados (Supabase)

1. Crie um novo projeto no [Supabase Dashboard](https://app.supabase.com/).
2. Vá em **SQL Editor**, clique em **New Query** e cole o script abaixo para criar toda a estrutura necessária:

```sql
-- 1. Definição de Tipos Customizados (Enums)
CREATE TYPE user_role AS ENUM ('client', 'distributor', 'consultant', 'super_admin');
CREATE TYPE material_type AS ENUM ('image', 'pdf', 'video');
CREATE TYPE user_status AS ENUM ('pending', 'active', 'inactive', 'rejected');

-- 2. Tabela de Perfis (Vinculada ao Auth do Supabase)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'client',
    whatsapp TEXT,
    cro TEXT,
    status user_status DEFAULT 'pending',
    preferences JSONB DEFAULT '{"theme": "light", "language": "pt-br"}',
    points INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Iniciante',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Materiais (O Material Pai)
CREATE TABLE public.materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title JSONB NOT NULL, -- Estrutura: {"pt-br": "Titulo", "en-us": "Title"}
    type material_type NOT NULL,
    category TEXT,
    allowed_roles user_role[] NOT NULL, -- Array de roles permitidas
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Arquivos/Recursos (Multilíngue)
CREATE TABLE public.material_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    language VARCHAR(5) NOT NULL, -- pt-br, en-us, es-es
    url TEXT NOT NULL,
    subtitle_url TEXT, -- Opcional para vídeos
    status TEXT DEFAULT 'published',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Trilhas (Collections)
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title JSONB NOT NULL,
    description JSONB,
    cover_image TEXT,
    allowed_roles user_role[] DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Itens da Trilha (Relacionamento Material-Trilha)
CREATE TABLE public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Progresso do Usuário (Gamificação)
CREATE TABLE public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    material_id UUID REFERENCES public.materials(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'completed',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, material_id)
);

-- 8. Função e Trigger para Criar Perfil Automático no Registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, whatsapp, cro)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário Novo'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client'),
    NEW.raw_user_meta_data->>'whatsapp',
    NEW.raw_user_meta_data->>'cro'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 9. Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- Exemplo de política: Usuário pode ler materiais permitidos para sua role
CREATE POLICY "Materiais visíveis por role" ON public.materials
FOR SELECT USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = ANY(allowed_roles)
);
```

1. **Configuração do Storage**:
    * Crie um bucket chamado `materials-public` no menu **Storage**.
    * Configure as políticas de acesso para permitir leitura pública ou autenticada.

---

## 2. Configuração do Código

1. Garanta que o código esteja em um repositório no **GitHub**, **GitLab** ou **Bitbucket**.
2. No arquivo `lib/mockDb.ts`, certifique-se de que `isMockMode` esteja definido como `false` para o ambiente de produção (ou use variáveis de ambiente para controlar isso dinamicamente).
    * *Dica: Você pode usar `import.meta.env.VITE_MOCK_MODE === 'true'`.*

---

## 3. Implantação na Vercel

1. Acesse o painel da [Vercel](https://vercel.com/) e clique em **Add New Project**.
2. Importe o repositório do projeto.
3. No passo **Configure Project**, expanda a seção **Environment Variables**.
4. Adicione as seguintes variáveis (essenciais):
    * `VITE_SUPABASE_URL`: (Encontrada em Project Settings > API no Supabase).
    * `VITE_SUPABASE_ANON_KEY`: (Encontrada em Project Settings > API no Supabase).
5. Em **Build and Output Settings**, mantenha os padrões do Vite:
    * Build Command: `npm run build`
    * Output Directory: `dist`
    * Install Command: `npm install`
6. Clique em **Deploy**.

---

## 4. Pós-Implantação

1. **Domínio**: Adicione seu domínio customizado nas configurações da Vercel.
2. **Auth**: No Supabase, adicione a URL da Vercel (ex: `https://meu-hub.vercel.app`) à lista de **Additional Redirect URLs** em Authentication > URL Configuration.
3. **Webhook**: Se for integrar com N8N ou ferramentas externas, configure a URL do webhook nas configurações do sistema dentro da plataforma.

---

## 5. Dicas de Manutenção

* **Logs**: Acompanhe o tráfego e erros via painel de Logs da Vercel.

* **Backups**: Ative os backups automáticos no Supabase.
* **Segurança**: Revise as políticas de RLS (Row Level Security) para garantir que usuários só vejam o que suas roles permitem.
