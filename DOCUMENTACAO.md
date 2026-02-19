# Documentação Técnica - Hub Conexão

## 1. Visão Geral

O **Hub Conexão** (também conhecido como **MaterialShare Pro**) é uma plataforma premium de distribuição de conteúdo e treinamento. Seu objetivo é centralizar materiais técnicos, de marketing e institucionais, oferecendo uma experiência de consumo gamificada para clientes, distribuidores e consultores.

---

## 2. Pilares Tecnológicos

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (Injetado via CDN para flexibilidade e performance)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage)
- **Roteamento**: [React Router 7](https://reactrouter.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Gamificação**: Sistema nativo de XP, Rankings e Barras de Progresso.

---

## 3. Principais Funcionalidades

### 📦 Gestão de Materiais (URL-First)

O sistema adota uma abordagem moderna baseada em **URLs Inteligentes**, eliminando uploads pesados e aproveitando o ecossistema de conteúdo existente.

- **Suporte Multi-Provider**: YouTube, Google Drive, Instagram, TikTok, LinkedIn e Links Diretos.
- **Detecção Automática**: O sistema identifica o tipo de material (Vídeo, PDF, Imagem) e gera embeds otimizados.
- **Visualização Universal**: Player unificado que se adapta à fonte do conteúdo.

> Para detalhes sobre a arquitetura e design system atualizado, consulte [ARCHITECTURE_UPDATES_2026.md](./docs/ARCHITECTURE_UPDATES_2026.md).

### 🛤️ Trilhas de Aprendizagem (Collections)

Agrupamentos lógicos de materiais que guiam o usuário através de um fluxo de conhecimento. Cada trilha possui:

- Metadados multilíngues.
- Barra de progresso visual.
- Recompensa em XP após conclusão.

### 🎮 Gamificação

Sistema de engajamento baseado em:

- **Pontos (XP)**: Acumulados ao consumir materiais e completar trilhas.
- **Rankings**: Níveis que evoluem conforme a pontuação (Iniciante, Bronze, Prata, Ouro, Master).
- **Feedback Visual**: Progress bars dinâmicas e badges de conclusão.

### 🌍 Internacionalização (i18n)

Suporte completo para **Português (BR)**, **Inglês (US)** e **Espanhol (ES)**. Todas as chaves são gerenciadas via `LanguageContext` sem dependências externas pesadas.

---

## 4. Arquitetura de Software

### Pasta `contexts/` (O "Motor" da App)

A aplicação utiliza uma hierarquia de Context Providers para gerenciar estados globais de forma estável (usando memoização rigorosa):

- `AuthContext`: Gestão de sessão Supabase e perfis de usuário.
- `LanguageContext`: Sistema de tradução e preferências de idioma.
- `ThemeContext`: Alternância entre modo claro e escuro (Dark/Light).
- `ShortcutContext`: Sistema centralizado de atalhos de teclado globais.
- `BrandContext`: Customização dinâmica da marca (branding).

### Estabilização de Performance

Todos os provedores foram estabilizados com `useMemo` e `useCallback` para evitar re-renderizações infinitas, especialmente em sistemas reativos como o de atalhos de teclado.

---

## 5. Estrutura de Diretórios

```text
/hubConexao
├── components/          # Componentes reutilizáveis (Cards, Modais, Layout)
├── contexts/            # Provedores de estado global
├── hooks/               # Custom hooks (Pagination, Shortcuts)
├── lib/                 # Configurações de clientes (Supabase, MockDB)
├── pages/               # Páginas principais da aplicação
├── styles/              # Arquivos CSS globais e transições
├── public/              # Ativos estáticos (Logos, SVGs)
└── types.ts             # Definições de tipos TypeScript centralizadas
```
