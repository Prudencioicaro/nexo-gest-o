# Projeto: Notion Pedrada 🚀

## Visão Geral
Uma aplicação de gestão de projetos inspirada no Notion, focada em simplicidade, velocidade e execução. O sistema utiliza uma única fonte de dados por quadro (tabela base) com múltiplas visualizações (Lentes).

---

## Stack Tecnológica

### Core
- **Framework:** React + Vite (TypeScript)
- **Estilização:** CSS Moderno (Custom Properties, Flexbox/Grid)
- **Gerenciamento de Estado:** Zustand (com persistência para Local-first)
- **Sincronização de Dados:** TanStack Query + Supabase SDK

### Backend (Supabase)
- **Database:** PostgreSQL (Tabelas relacionais)
- **Autenticação:** Supabase Auth (E-mail/Senha)
- **Storage:** Supabase Storage (Imagens, PDFs, Links)
- **Realtime:** Supabase Presence/Broadcast (para sincronização leve)

### Bibliotecas Chave
- **Drag & Drop:** `@dnd-kit` (Performance superior)
- **Gráficos:** `Recharts` (Minimalista e funcional)
- **Datas:** `date-fns` (Manipulação de calendário)
- **Ícones:** `Lucide React`

---

## Arquitetura de Dados

### Tabelas (Schema SQL)
1.  **profiles:** Dados dos usuários (id, email, nome, avatar).
2.  **boards:** Contextos isolados (id, nome, dono_id, criado_at).
3.  **board_members:** Gerenciamento de permissões (board_id, user_id, role).
4.  **board_columns:** Definição dos campos personalizados do quadro (nome, tipo, config).
5.  **tasks:** Dados das tarefas (id, board_id, data_json, criado_at).
6.  **views:** Visualizações salvas (id, board_id, tipo, filtros, ordenação).
7.  **comments:** Comentários por tarefa.
8.  **task_history:** Log de alterações minimalista.

---

## Princípios de Desenvolvimento
1.  **Local-First:** O estado local é soberano. As atualizações no banco ocorrem em background.
2.  **Optimistic UI:** Qualquer ação do usuário reflete instantaneamente na tela.
3.  **Single Source of Truth:** Uma tarefa editada na visão Kanban é automaticamente atualizada na visão Lista e Calendário sem recarregar.
4.  **Performance:** Evitar re-renders globais usando seletores precisos no Zustand.
