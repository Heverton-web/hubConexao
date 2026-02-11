# Planejamento de Arquitetura: MaterialShare Pro

Abaixo estão três abordagens para estruturar o banco de dados (Supabase/PostgreSQL) e a lógica de negócios.

## Base Comum (Aplicável a todas as abordagens)

Independente da abordagem escolhida, estas tabelas são essenciais para vincular o `auth.users` do Supabase aos dados de negócio.

**Tabela: `public.profiles`**
*   **id:** uuid (PK, FK -> auth.users.id)
*   **name:** text
*   **role:** enum ('client', 'distributor', 'consultant', 'super_admin')
*   **cro:** text (nullable, apenas para perfis relevantes)
*   **whatsapp:** text
*   **preferences:** jsonb (default: `{"theme": "light", "language": "pt-br"}`)

---

## Abordagem 1: Relacional Normalizada (SQL Clássico)

Focada na integridade referencial estrita. Cada entidade e relação tem sua própria tabela.

### 1. Organização de Usuários e Permissões
As permissões são definidas por uma tabela de junção (Many-to-Many).
*   O campo `role` na tabela `profiles` define quem o usuário é.
*   Uma tabela `material_permissions` define quem pode ver o quê.

### 2. Modelagem de Materiais
Separação total entre o "conceito" do material e seus arquivos físicos.

*   **`materials`**: (id, title, type [img, pdf, video], created_at, created_by)
*   **`material_assets`**: (id, material_id, language [pt, en, es], file_url, subtitle_url, created_at)
*   **`material_visibility`**: (material_id, role) -> *Uma linha para cada perfil que pode ver.*

### 3. Tratamento de Tema e Idioma Global
Armazenado como colunas individuais ou JSON simples na tabela `profiles`. O frontend lê isso no login e aplica via Context API.

### Vantagens e Riscos
*   **Vantagens:** Integridade de dados absoluta. Consultas muito poderosas (ex: "Quantos materiais têm versão em Espanhol?"). Fácil de deletar versões específicas sem tocar no material pai.
*   **Riscos:** Maior complexidade de queries (muitos JOINs). A inserção de um material requer 3 etapas de gravação (Material -> Assets -> Permissions).

---

## Abordagem 2: Document-Oriented (JSONB / NoSQL Style)

Focada em agilidade de leitura e simplicidade de inserção, aproveitando o suporte nativo do PostgreSQL a JSONB.

### 1. Organização de Usuários e Permissões
As permissões vivem dentro do registro do próprio material.

### 2. Modelagem de Materiais
Tudo reside em uma única tabela, usando colunas JSONB para versões e Arrays para permissões.

*   **`materials`**:
    *   `id`: uuid
    *   `meta`: jsonb (Título, Descrição)
    *   `type`: enum
    *   `assets`: jsonb -> Estrutura: `{"pt-br": {"file": "url...", "sub": "url..."}, "en-us": {...}}`
    *   `allowed_roles`: text[] (Array de strings, ex: `['client', 'distributor']`)

### 3. Tratamento de Tema e Idioma Global
Igual à base comum, campo JSONB no `profile`.

### Vantagens e Riscos
*   **Vantagens:** Leitura extremamente rápida (um único SELECT traz tudo). O frontend recebe o objeto pronto para renderizar. Desenvolvimento inicial muito veloz.
*   **Riscos:** Difícil validar integridade (ex: garantir que a URL do arquivo é válida). Consultas complexas de agregação são mais lentas. Alterar a estrutura do objeto JSON no futuro requer scripts de migração complexos. Row Level Security (RLS) com JSONB pode ser ligeiramente mais custoso para a CPU do banco.

---

## Abordagem 3: Híbrida Otimizada para Supabase (Recomendada)

Combina a integridade relacional para arquivos (já que vídeos têm legendas e complexidades) com a simplicidade de Arrays do Postgres para permissões (já que são apenas 4 roles fixas).

### 1. Organização de Usuários e Permissões (Array Columns)
Em vez de uma tabela de junção, usamos colunas de Array do Postgres, que funcionam perfeitamente com as Policies do Supabase.

*   **Tabela `profiles`**: Mantém estrutura base.
*   **Validação**: RLS verifica se `auth.uid()` -> `profile.role` está contido no array de permissão do material.

### 2. Modelagem de Materiais
*   **`materials`**:
    *   `id`: uuid
    *   `title`: text
    *   `type`: enum (image, pdf, video)
    *   `allowed_roles`: enum[] (Array de enums: `['client', 'distributor']`)
*   **`material_assets`**:
    *   `id`: uuid
    *   `material_id`: uuid (FK)
    *   `language`: char(5) (pt-br, en-us, es-es)
    *   `resource_url`: text
    *   `subtitle_url`: text (nullable, usado para vídeos)

### 3. Tratamento de Tema e Idioma Global
Armazenado na tabela `profiles` na coluna `preferences` (JSONB).
*   Exemplo: `update profiles set preferences = jsonb_set(preferences, '{theme}', '"dark"') where id = auth.uid()`

### Vantagens e Riscos
*   **Vantagens:**
    *   **Performance de RLS:** O operador `ANY` do Postgres em arrays é muito rápido para verificar permissões.
    *   **Flexibilidade de Assets:** Como vídeos exigem legendas e PDFs não, ter uma tabela filha `material_assets` é mais limpo que um JSON gigante.
    *   **UI do Admin:** Facilita para o Super Admin gerenciar arquivos individuais (ex: "Excluir apenas a versão em Inglês") sem risco de corromper o JSON do material inteiro.
*   **Riscos:** Exige conhecimento básico de sintaxe de Array do Postgres.

---

## Recomendação Final: Abordagem 3 (Híbrida)

Esta é a abordagem mais **simples, escalável e segura** para o seu cenário.

### Por que?
1.  **Segurança (RLS):** Escrever uma regra de segurança no Supabase é trivial com arrays:
    `create policy "Access" on materials for select using ( (select role from profiles where id = auth.uid()) = ANY(allowed_roles) );`
2.  **Multilíngue:** A separação dos assets (Abordagem Relacional) é superior quando temos requisitos assimétricos (vídeos têm legendas, imagens não). Se no futuro você quiser adicionar um idioma novo, basta inserir linhas, não precisa reescrever objetos JSON.
3.  **Frontend:** O React receberá uma lista de materiais e fará um join simples para pegar os assets, facilitando a lógica de "se não tem PT-BR, desabilita o botão".

### Próximos Passos Sugeridos
1.  Configurar o projeto Supabase.
2.  Criar a tabela `profiles` com Trigger para criar perfil automaticamente ao cadastrar usuário no Auth.
3.  Criar tabelas `materials` e `material_assets`.
4.  Configurar Buckets no Supabase Storage:
    *   `materials-private`: Apenas acessível via URL assinada ou políticas restritas.
    *   Organizar pastas: `/{material_id}/{lang}/arquivo.pdf`
