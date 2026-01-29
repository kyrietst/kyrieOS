# User Stories - Semana 1

## História 1: Autenticação

**Como** usuário **Eu quero** fazer login com email e senha **Para que** eu
possa acessar meu dashboard seguro

**Critérios de Aceitação:**

- [ ] Página de login existe (/login)
- [ ] Validação de email e senha
- [ ] Sucesso redireciona para o dashboard correto
- [ ] Erro exibe mensagem amigável ("Credenciais inválidas")
- [ ] Sessão persiste após refresh

**Técnico:**

- Auth Supabase
- Página de login Next.js
- Redirecionamento via Middleware

---

## História 2: Roteamento Baseado em Papéis (RBAC)

**Como** administrador **Eu quero** ver o painel administrativo **Para que** eu
possa gerenciar todos os clientes

**Critérios de Aceitação:**

- [ ] Admin (Gilmar) redirecionado para `/kyrie/dashboard`
- [ ] Cliente redirecionado para `/client/dashboard`
- [ ] Cliente tentando acessar rota `/kyrie` é bloqueado ou redirecionado
- [ ] Admin tentando acessar rota `/client` direto é redirecionado corretamente
      (ou tem view especial)

**Técnico:**

- middleware.ts
- Grupos de rota (kyrie) e (client)
- Verificação de role no banco de dados (tabela users)

---

## História 3: Layouts Dedicados

**Como** usuário do sistema **Eu quero** uma interface adequada ao meu perfil
**Para que** eu tenha acesso rápido às minhas ferramentas

**Critérios de Aceitação:**

- [ ] Layout Admin tem sidebar com: Dashboard, Clientes, Backlog, Insights
- [ ] Layout Cliente tem sidebar com: Dashboard, Projetos, Relatórios, Tutoriais
- [ ] Ambos layouts mostram usuário logado e botão de sair
- [ ] Design responsivo básico

**Técnico:**

- component: `AdminSidebar`
- component: `ClientSidebar`
- component: `UserMenu`
