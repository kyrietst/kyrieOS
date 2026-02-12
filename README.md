# Kyrie OS 2.0 🚀

Sistema Operacional de Agência para gestão de projetos, clientes e inteligência
artificial.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (v18 ou superior)
- **Python** (v3.11 ou superior)
- **Git**

---

## ⚙️ Configuração do Ambiente

1. **Frontend (.env.local):** Certifique-se de que o arquivo `.env.local` na
   raiz do projeto contenha:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
   NEXT_PUBLIC_API_URL=http://localhost:8002
   ```

2. **Backend (.env):** O backend Python precisa de um arquivo `.env` na raiz (ou
   dentro de `api/`) com as chaves de serviço do Supabase e APIs de IA
   (Gemini/Groq).

---

## 🚀 Como Iniciar o Projeto

Para rodar o sistema completo, você precisará de **dois terminais** abertos.

### 1. Iniciar o Backend (API Python)

O backend é responsável pela Inteligência Artificial e geração de relatórios.

**Opção Recomendada (Windows PowerShell):** Execute o script de inicialização
automática:

```powershell
.\start-backend.ps1
```

_Se for a primeira vez, use `.\start-backend.ps1 --install` para baixar as
dependências._

**Opção Manual:**

```bash
# Ative seu ambiente virtual (ex: venv)
pip install -r api/requirements.txt
python -m api.main
```

_O servidor rodará em: `http://localhost:8002`_

### 2. Iniciar o Frontend (Next.js)

O frontend é a interface visual (Dashboard Administrativo e Portal do Cliente).

```bash
npm install  # Apenas na primeira vez
npm run dev
```

_Acesse em: `http://localhost:3000`_

---

## 🔗 Links Importantes

- **Dashboard Admin:**
  [http://localhost:3000/kyrie/dashboard](http://localhost:3000/kyrie/dashboard)
- **Portal do Cliente:**
  [http://localhost:3000/client/approvals](http://localhost:3000/client/approvals)
- **Documentação da API:**
  [http://localhost:8002/docs](http://localhost:8002/docs)

## 📚 Documentação (Kyrie Docs)

A documentação técnica do sistema está centralizada na pasta `docs/`:

- **[Arquitetura e Segurança](./docs/architecture/)**: Specs de API, Diagramas, RLS e Migrations.
- **[Funcionalidades (PRDs)](./docs/features/)**: Requisitos e especificações de cada módulo.
- **[Planos de Implementação](./docs/plans/)**: Roadmaps e planos de execução aprovados.
- **[Guias e Walkthroughs](./docs/guides/)**: Histórico de mudanças e guias de onboarding.

---

## 🛠️ Tecnologias

- **Frontend:** Next.js 14, Tailwind CSS, Shadcn UI
- **Backend:** Python (FastAPI), LangGraph
- **Banco de Dados:** Supabase (PostgreSQL)
- **IA:** Google Gemini 2.0 Flash
