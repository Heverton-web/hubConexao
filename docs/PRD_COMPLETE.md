# PRD - Plataforma Hub Conexão (Versão Aura 2026)

## 1. Visão Geral do Produto
O **Hub Conexão** é uma plataforma centralizada de gestão e distribuição de materiais promocionais, técnicos e institucionais. O objetivo é conectar a marca (Seara/Heverton) a seus parceiros (Distribuidores, Clientes e Consultores), garantindo que todos tenham acesso rápido à versão mais atualizada de catálogos, vídeos e informativos, enquanto incentiva o engajamento através de um sistema de gamificação.

---

## 2. Experiência e Design (Aura 2026)
A plataforma utiliza o sistema de design **Aura 2026**, caracterizado por:
- **Aura Glass (Liquid Glass):** Glassmorphism refinado com alta transparência, desfoque de fundo (backdrop-blur) e bordas luminosas.
- **Tipografia Premium:** Uso de fontes modernas com tracking espaçado e pesos variantes para hierarquia clara.
- **Neon Accents:** Uso de cores vibrantes (Cyan para ações, Roxo para métricas, Verde para sucesso) com glow dinâmico.
- **Micro-animações:** Transições suaves de "reveal" e estados de hover que conferem uma sensação de luxo e tecnologia.

---

## 3. Arquitetura Técnica
- **Frontend:** Astro + React (para componentes interativos).
- **Estilização:** Vanilla CSS combinado com utilitários Tailwind para agilidade, seguindo tokens do sistema Aura.
- **Bancos de Dados & Backend:** Supabase (PostgreSQL, Auth, Storage).
- **Gerenciamento de Estado:** React Context API (Auth, Language, Toast, Theme).
- **Métricas:** Recharts para visualização de dados.
- **Integração:** Webhooks para n8n e futuras integrações via API (Protheus).

---

## 4. Módulos e Funcionalidades

### 4.1. Painel Administrativo (Central de Comando)
- **Gestão de Materiais:** CRUD completo de PDFs, Vídeos e Imagens com suporte Multi-idioma.
- **Coleções (Trilhas):** Agrupamento lógico de materiais para onboarding ou campanhas específicas, com controle de progresso.
- **Controle de Usuários:** Gestão de perfis (Client, Distributor, Consultant, Super Admin) e status de aprovação.
- **Analytics Avançado:** Visualização de tendências de acesso, materiais mais populares e engajamento por perfil.
- **Configurações do Sistema:** Customização de cores, logos e URLs de webhooks em tempo real.

### 4.2. Área do Usuário (Hub do Parceiro)
- **Dashboard Luminous:** Visão rápida de novos materiais e progresso em coleções.
- **Biblioteca de Materiais:** Navegação rápida com filtros por tipo e busca instantânea.
- **Minhas Coleções:** Trilhas de aprendizado ou kits de venda atribuídos ao usuário.
- **Perfil e Gamificação:** Visualização de pontos acumulados, rank atual e conquistas.

---

## 5. Gamificação e Engajamento
O sistema recompensa o consumo de conteúdo para garantir que a informação chegue à ponta:
- **Pontuação:** Usuários ganham pontos ao abrir materiais ou completar coleções.
- **Sistema de Ranks:** 
    - *Iniciante* (0 pts)
    - *Bronze* (500 pts)
    - *Prata* (1500 pts)
    - *Ouro* (3000 pts)
    - *Esmeralda* (5000 pts)
    - *Master* (10000 pts)
- **Feedback Visual:** Efeitos de partículas e animações ao atingir novos níveis.

---

## 6. Modelo de Dados (Supabase)
### Tabelas Principais:
- `profiles`: Dados do usuário, role, status, pontos e rank.
- `materials`: Definição base do material e roles permitidos.
- `material_assets`: Links de arquivos e idiomas correspondentes (um material pode ter assets em pt-br, en-us, es-es).
- `collections`: Títulos e metadados das trilhas.
- `collection_items`: Pivô entre materiais e coleções com ordem lógica.
- `access_logs`: Registro histórico de quem acessou o quê, quando e em qual idioma.
- `system_config`: Armazenamento de configurações de branding e temas.

---

## 7. Segurança e Regras de Negócio
- **RLS (Row Level Security):** Usuários só podem acessar materiais cujas `allowed_roles` correspondam ao seu perfil.
- **Status de Aprovação:** Novos cadastros entram como `pending` e precisam de aprovação administrativa para acessar o conteúdo.
- **Internacionalização (i18n):** Tradução nativa de toda a interface e suporte a conteúdos específicos por mercado.

---

## 8. Roadmap e Expansões
- **Fase 2:** Integração automática com n8n para disparo de notificações via WhatsApp ao lançar novos materiais.
- **Fase 3:** Sistema de "Favoritos" e "Download em Lote".
- **Fase 4:** Dashboard de metas para distribuidores baseado no consumo de materiais técnicos por suas equipes.
- **Fase 5:** Mobile App nativo para acesso offline.
