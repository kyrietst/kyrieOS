# Roadmap Futuro: Kyrie OS (Pós-MVP)

Este documento descreve as melhorias e novas funcionalidades planejadas para as
próximas fases do Kyrie OS.

## 🚀 Fase 2: Escala & Real Data (Próximas 4 Semanas)

### 1. Integrações Reais

- [ ] **Clockify API:** Substituir o mock pelo cliente real do Clockify para
      puxar horas trabalhadas.
- [ ] **Google Sheets API:** Ler planilhas financeiras reais dos clientes.
- [ ] **Stripe/Asaas:** Integração para leitura de status de pagamentos.

### 2. Inteligência Aprofundada

- [ ] **Agente "Business Calculator":** Implementar a lógica real de ROI baseada
      em inputs financeiros.
- [ ] **Chat com Dados:** Widget de chat onde o cliente pode perguntar "Quanto
      investimos mês passado?" e a IA responde consultando o banco.
- [ ] **Análise de Sentimento:** Analisar emails/mensagens para detectar riscos
      de churn.

### 3. Melhorias de UX/UI

- [ ] **Dark/Light Mode Toggle:** Permitir que o usuário escolha o tema.
- [ ] **Mobile Responsive:** Refinar as tabelas e dashboards para funcionar
      perfeito no celular.
- [ ] **Notificações:** Sistema de notificações in-app (Sinetinho).

## 🔮 Fase 3: Pleno "Operating System" (Q3 2026)

### 1. Client Onboarding Automático

- Link de convite onde o próprio cliente cria a conta e conecta as ferramentas
  dele.

### 2. Marketplace de Agentes

- Permitir ativar/desativar agentes específicos por cliente ("Advisor de SEO",
  "Analista Financeiro").

### 3. App Nativo

- Wrapper PWA ou React Native para ter ícone na home do celular.

## 🛠️ Débito Técnico & Infra

- [ ] **CI/CD:** Configurar GitHub Actions para deploy automático.
- [ ] **Testes E2E:** Implementar Playwright para testar fluxos críticos (Login
      -> Gerar Relatório).
- [ ] **Monitoramento:** Sentry para logs de erro no Frontend e Backend.
