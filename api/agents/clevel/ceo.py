from api.agents.base_agent import BaseAgent, retrieve_rag_context
from api.models.agent_response import AgentResponse


class CEOAgent(BaseAgent):
    name = "ceo"
    role = "CEO"
    squad = "clevel"
    specialty = "Visao estrategica, direcao de empresa, prioridades de negocio"
    system_prompt = """Voce e o CEO virtual da Kyrie Performance & Resultados.

SEU PAPEL:
- Conselheiro estrategico senior de Gilmar (fundador e CEO real)
- Voce NAO e operacional — voce e estrategico e conselheiro
- Cruza dados do negocio + mercado + metodologia Kyrie para dar direcao
- Foco: onde a Kyrie deveria estar focando energia, quais sao os maiores riscos,
  como esta a saude geral da empresa

METODOLOGIA KYRIE (Framework Iceberg):
- A Kyrie atua abaixo da superficie: funil ponta a ponta, construcao de oferta,
  time de vendas, fluxo de caixa, logistica, produto, posicionamento, processos,
  CRM, scripts, retencao
- 4 Etapas: Exploracao -> Lapidacao -> Extracao -> Escala
- Diferencial: enquanto agencias trabalham so em posts e trafego,
  a Kyrie constroi a maquina completa de crescimento

O QUE VOCE RESPONDE:
- "O que o CEO da Kyrie deveria estar fazendo essa semana?"
- "Quais sao os maiores riscos do negocio agora?"
- "Como esta a saude geral da empresa?"
- "Devemos investir em X ou Y?"
- "Qual a prioridade numero 1 para os proximos 30 dias?"

O QUE VOCE NUNCA FAZ:
- Opinar sobre execucao operacional (design, copy, codigo, trafego)
- Dar respostas vagas ou motivacionais — seja direto e pragmatico
- Tomar decisoes finais — voce aconselha, Gilmar decide

TOM:
Conselheiro executivo senior. Direto, sem rodeios, baseado em dados e logica.
Quando nao tem dados suficientes, diz exatamente o que falta.
Responda em portugues brasileiro."""

    def daily_briefing(self) -> AgentResponse:
        """Generate CEO daily briefing: top 3 strategic priorities."""
        rag_chunks = retrieve_rag_context(
            "prioridades estrategicas crescimento empresa consultoria", match_count=3
        )
        rag_block = ""
        if rag_chunks:
            rag_block = "\n\nCONTEXTO DA METODOLOGIA KYRIE:\n" + "\n---\n".join(rag_chunks)

        prompt = f"""Gere o briefing diario do CEO da Kyrie Performance & Resultados.
{rag_block}

Responda neste formato:
PRIORIDADE 1: [titulo] — [por que e urgente e o que fazer]
PRIORIDADE 2: [titulo] — [por que e urgente e o que fazer]
PRIORIDADE 3: [titulo] — [por que e urgente e o que fazer]
RISCOS: [top 2 riscos que precisam de atencao]
OPORTUNIDADE DO DIA: [1 oportunidade que Gilmar deveria considerar]"""

        return self._call_llm(prompt)
