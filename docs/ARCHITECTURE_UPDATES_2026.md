# Atualizações de Arquitetura e Design (Fevereiro 2026)

Este documento registra as mudanças arquiteturais significativas realizadas para modernizar o **Hub Conexão**, focando na transição para um modelo **URL-First** e no refinamento visual **Aura Liquid Glass**.

---

## 1. Mudança de Paradigma: URL-First Asset Management

Anteriormente, o sistema dependia de upload direto de arquivos (Blobs) para o Supabase Storage. Esta abordagem foi substituída por um modelo mais flexível e moderno baseado em URLs.

### 1.1. Motivação

- **Redução de Custo/Complexidade**: Elimina a necessidade de grandes volumes de armazenamento (Storage) e largura de banda.
- **Ecossistema Integrado**: Permite aproveitar conteúdos já hospedados em plataformas especializadas (YouTube, Google Drive, Vimeo, Redes Sociais).
- **Experiência do Admin**: Copiar e colar um link é infinitamente mais rápido do que fazer upload de gigabytes.

### 1.2. Fluxo de Inserção de Material (Refatorado)

O componente `MaterialFormModal` foi completamente reescrito:

1. **Detecção Automática (`urlDetector.ts`)**:

- O admin cola uma URL.
- O sistema identifica o **Provider** (YouTube, Google Drive, Instagram, TikTok, LinkedIn, Direct Link).
- O sistema infere o **Tipo de Material** (Vídeo, Imagem, PDF).
- Gera automaticamente **Links de Embed** e **Thumbnails** (ex: `img.youtube.com/...`).

1. **Schema de Dados**:

- A tabela `material_assets` agora armazena a `url` externa como fonte da verdade, não mais um `path` interno.
- O campo `status` ('published') é mantido para controle.

### 1.3. Visualização (`ViewerModal`)

O player foi atualizado para ser um **Universal Embedder**:

- **YouTube**: Usa `iframe` com parâmetros de privacidade e autoplay.
- **Google Drive**:
  - Detecta IDs de arquivos Drive.
  - Suporta modo "Embed" (visualizador do Google) e modo "Nativo" (mp4 direto via proxy de download, quando possível).
- **Redes Sociais**: Suporte a iframes de Instagram, TikTok e LinkedIn.
- **Fallback**: Botões "Abrir na Fonte" para garantir acesso mesmo com restrições de CORS/X-Frame-Options.

---

## 2. Aura Design System: Refinamento "Liquid Glass"

O sistema visual foi polido para eliminar aspectos "duros" e criar uma interface fluida e premium.

### 2.1. Filosofia "Zero Chalk" (Sem Efeito Giz)

O "efeito giz" (bordas finas de alto contraste, 1px sólido sobre fundo escuro) foi banido.

- **Antes**: `border border-white/10` ou `border-accent`.
- **Agora**: Bordas definidas por luz e superfície, não por traços.
  - **Inativo**: `bg-white/[0.015]` com borda `border-white/[0.01]` (quase imperceptível).
  - **Ativo/Selecionado**: `bg-accent/[0.06]` sem borda (`border-transparent`). O volume é dado pelo background colorido sutil.
  - **Foco**: Apenas uma leve intensificação do background, sem anéis de foco duros.

### 2.2. Inputs e Controles

- **Inputs Numéricos**: Removidos os "spin buttons" (setas) nativas para um visual limpo (`appearance: none`).
- **Tags Input**: Unificado visualmente com os inputs de texto (fundo ultra-transparente).
- **Badges**: Cores de providers (YouTube Vermelho, Drive Azul, etc.) usadas com opacidade very-low no background e full no texto.

---

## 3. Estrutura de Código Atualizada

### Novos Utilitários

- **`lib/urlDetector.ts`**: Centraliza toda a lógica de regex e detecção de provedores. Retorna objeto padronizado `UrlDetectionResult`.

### Componentes Chave Atualizados

- **`components/MaterialFormModal.tsx`**: Layout vertical, remoção de Drag&Drop, adição de inputs inteligentes.
- **`components/ViewerModal.tsx`**: Lógica de renderização switch-case baseada no provider detectado.
- **`pages/Dashboard.tsx`**: Sidebar agora exibe contadores reais de coleções ("Trilhas").

---

## 4. Próximos Passos Recomendados

1. **Migração de Dados Legados**: Se houver materiais antigos com paths de storage, criar um script para gerar URLs públicas assinadas e salvar como URLs estáticas, ou manter retrocompatibilidade.
2. **Cache de Metadata**: Para links externos (como títulos de YouTube), implementar um fetch no backend (Edge Function) para pré-popular o título do material automaticamente.
