import uuid
from typing import Dict, List

from api.agents.base_agent import BaseAgent, retrieve_rag_context
from api.models.project_brief import ProjectBrief, BriefStatus
from api.models.agent_response import AgentResponse

# Squad imports
from api.agents.squads.digital.traffic_manager import TrafficManagerAgent
from api.agents.squads.digital.copywriter import CopywriterAgent
from api.agents.squads.digital.social_media import SocialMediaAgent
from api.agents.squads.digital.sales_analyst import SalesAnalystAgent
from api.agents.squads.digital.web_designer import WebDesignerAgent
from api.agents.squads.creative.designer import DesignerAgent
from api.agents.squads.creative.motion_designer import MotionDesignerAgent
from api.agents.squads.creative.modeler_3d import Modeler3DAgent
from api.agents.squads.creative.renderer_3d import Renderer3DAgent
from api.agents.squads.creative.vfx_editor import VFXEditorAgent
from api.agents.squads.tech.developer import DeveloperAgent
from api.agents.squads.tech.automation_manager import AutomationManagerAgent
from api.agents.squads.tech.ai_manager import AIManagerAgent
from api.agents.squads.commercial.hunter_bdr import HunterBDRAgent
from api.agents.squads.commercial.sdr import SDRAgent
from api.agents.squads.commercial.closer import CloserAgent
from api.agents.squads.commercial.sales_leader import SalesLeaderAgent


GP_SYSTEM_PROMPT = """Voce e o Gestor de Projetos da Kyrie Performance & Resultados.

SEU PAPEL:
- Voce e o orquestrador central de todas as demandas
- Recebe pedidos do time ou de clientes e transforma em briefings acionaveis
- Decide quais squads devem ser ativados e em qual ordem
- Valida se os outputs dos squads estao alinhados com a estrategia

METODOLOGIA KYRIE (Framework Iceberg):
- A maioria das agencias trabalha so na superficie (posts, trafego pago, metricas de vaidade)
- A Kyrie atua no que esta abaixo: funil ponta a ponta, construcao de oferta, time de vendas,
  fluxo de caixa, logistica, produto, posicionamento, processos, CRM, scripts, retencao
- 4 Etapas: Exploracao -> Lapidacao -> Extracao -> Escala

SQUADS DISPONIVEIS:
- digital: Gestor de Trafego, Copywriter, Social Media, Analista de Vendas, Web Designer
- creative: Designer, Motion Designer, Modelador 3D, Renderizador 3D, Editor VFX
- tech: Desenvolvedor, Gestor de Automacoes, Gestor de IA
- commercial: Hunter/BDR, SDR, Closer, Lider de Vendas

REGRAS DE ROTEAMENTO (SIGA EXATAMENTE):
- Campanha de trafego pago -> digital + creative (NUNCA commercial)
- Conteudo para redes sociais -> digital + creative (NUNCA commercial)
- Desenvolvimento de produto/sistema -> tech (+ digital se tiver copy)
- Estrategia pura de negocios -> apenas voce (GP) + C-Level
- Prospeccao de novos clientes / vendas / scripts de vendas -> commercial
- Lancamento completo -> digital + creative + tech + commercial

IMPORTANTE: O squad commercial so deve ser ativado quando a demanda for EXPLICITAMENTE sobre:
- Prospeccao de novos clientes
- Preparacao de reuniao comercial
- Scripts de vendas ou abordagem
- Pipeline e forecast comercial
NAO ative commercial para campanhas de marketing, trafego, conteudo ou desenvolvimento.

FORMATO DE RESPOSTA:
Sempre responda em formato estruturado com secoes claras.
Responda em portugues brasileiro."""


# Keywords that indicate the commercial squad should be activated
COMMERCIAL_KEYWORDS = [
    "prospectar", "prospeccao", "prospecção",
    "novos clientes", "captar clientes",
    "reuniao comercial", "reunião comercial",
    "script de vendas", "scripts de vendas",
    "pipeline comercial", "forecast",
    "abordagem comercial", "abordagem fria",
    "outbound", "cold call",
    "hunter", "bdr", "sdr", "closer",
    "time de vendas", "equipe comercial",
]


SQUAD_REGISTRY: Dict[str, list] = {
    "digital": [
        TrafficManagerAgent,
        CopywriterAgent,
        SocialMediaAgent,
        SalesAnalystAgent,
        WebDesignerAgent,
    ],
    "creative": [
        DesignerAgent,
        MotionDesignerAgent,
        Modeler3DAgent,
        Renderer3DAgent,
        VFXEditorAgent,
    ],
    "tech": [
        DeveloperAgent,
        AutomationManagerAgent,
        AIManagerAgent,
    ],
    "commercial": [
        HunterBDRAgent,
        SDRAgent,
        CloserAgent,
        SalesLeaderAgent,
    ],
}

# Order matters: digital before creative, tech last
SQUAD_EXECUTION_ORDER = ["digital", "creative", "commercial", "tech"]


class ProjectManagerAgent(BaseAgent):
    name = "gestor_de_projetos"
    role = "Gestor de Projetos"
    squad = "management"
    specialty = "Orquestracao de projetos, estrategia e metodologia Kyrie"
    system_prompt = GP_SYSTEM_PROMPT

    def analyze_request(self, request: str, client_name: str = None) -> ProjectBrief:
        """Create initial brief from a raw request, using RAG for strategic context."""
        # RAG: fetch Kyrie methodology context
        rag_chunks = retrieve_rag_context(request, match_count=4)
        rag_block = ""
        if rag_chunks:
            rag_block = "\n\nCONTEXTO DA BASE DE CONHECIMENTO KYRIE:\n" + "\n---\n".join(
                rag_chunks
            )

        prompt = f"""Analise esta demanda e crie um briefing estruturado.

DEMANDA: {request}
CLIENTE: {client_name or 'Nao informado'}
{rag_block}

Responda EXATAMENTE neste formato (mantenha os rotulos):
OBJETIVO: [objetivo claro e mensuravel]
PUBLICO-ALVO: [quem e o publico]
RESTRICOES: [limitacoes, prazos, orcamento se mencionado]
SQUADS_NECESSARIOS: [lista separada por virgula: digital, creative, tech, commercial]
ANALISE_ESTRATEGICA: [sua analise usando a metodologia Kyrie, conectando com o contexto do RAG se disponivel]"""

        response = self._call_llm(prompt)
        content = response.content

        # Parse structured response
        objective = self._extract_field(content, "OBJETIVO")
        target_audience = self._extract_field(content, "PUBLICO-ALVO")
        constraints = self._extract_field(content, "RESTRICOES")
        squads_raw = self._extract_field(content, "SQUADS_NECESSARIOS")
        strategic_analysis = self._extract_field(content, "ANALISE_ESTRATEGICA")

        # Parse squads list
        squads_needed = []
        if squads_raw:
            for s in squads_raw.split(","):
                s = s.strip().lower()
                if s in SQUAD_REGISTRY:
                    squads_needed.append(s)

        # Fallback: if no squads parsed, default to digital
        if not squads_needed:
            squads_needed = ["digital"]

        brief = ProjectBrief(
            brief_id=str(uuid.uuid4())[:8],
            original_request=request,
            client_name=client_name,
            objective=objective or "A definir",
            target_audience=target_audience or "A definir",
            constraints=constraints,
            squads_needed=squads_needed,
            strategic_analysis=strategic_analysis or content,
            status=BriefStatus.IN_ANALYSIS,
        )

        brief.add_contribution(
            self.squad, self.name, f"Brief inicial criado. Squads: {squads_needed}"
        )

        return brief

    @staticmethod
    def _should_activate_commercial(request: str) -> bool:
        """Server-side guardrail: only activate commercial for explicit sales/prospecting."""
        request_lower = request.lower()
        return any(kw in request_lower for kw in COMMERCIAL_KEYWORDS)

    def route_to_squads(self, brief: ProjectBrief) -> ProjectBrief:
        """Activate squads in correct order and collect contributions."""
        # Guardrail: filter out commercial if request doesn't match
        if "commercial" in brief.squads_needed and not self._should_activate_commercial(
            brief.original_request
        ):
            brief.squads_needed.remove("commercial")
            print("INFO: [GP] Guardrail removed 'commercial' — not a sales/prospecting request")

        activated_squads = []

        for squad_name in SQUAD_EXECUTION_ORDER:
            if squad_name not in brief.squads_needed:
                continue

            # Update status
            status_map = {
                "digital": BriefStatus.SQUAD_DIGITAL,
                "creative": BriefStatus.SQUAD_CREATIVE,
                "tech": BriefStatus.SQUAD_TECH,
                "commercial": BriefStatus.SQUAD_COMMERCIAL,
            }
            brief.status = status_map.get(squad_name, BriefStatus.IN_ANALYSIS)

            # Run each agent in the squad
            agent_classes = SQUAD_REGISTRY[squad_name]
            for agent_cls in agent_classes:
                agent = agent_cls()
                contribution = agent.squad_debate(brief)
                print(
                    f"INFO: [{squad_name}/{agent.name}] contributed "
                    f"({len(contribution.contribution)} chars)"
                )

            activated_squads.append(squad_name)

        # Store squad-specific outputs on the brief
        self._aggregate_squad_outputs(brief)
        return brief

    def validate_brief(self, brief: ProjectBrief) -> ProjectBrief:
        """Validate coherence across all squad contributions."""
        brief.status = BriefStatus.GP_REVIEW

        prompt = f"""Voce recebeu as contribuicoes de todos os squads para este projeto.
Valide a coerencia entre elas.

{brief.get_brief_summary()}

Responda EXATAMENTE neste formato:
VALIDACAO: [APROVADO ou REVISAO_NECESSARIA]
COERENCIA: [analise de como as contribuicoes se complementam]
PONTOS_FORTES: [o que ficou bom]
GAPS: [o que faltou ou precisa ajuste]
OUTPUT_FINAL: [sintese executiva do projeto completo, integrando todas as contribuicoes em um plano acionavel]"""

        response = self._call_llm(prompt)
        content = response.content

        brief.gp_validation = (
            self._extract_field(content, "VALIDACAO")
            or "APROVADO"
        )
        brief.final_output = (
            self._extract_field(content, "OUTPUT_FINAL")
            or content
        )

        brief.add_contribution(self.squad, self.name, f"Validacao: {brief.gp_validation}")
        brief.status = BriefStatus.COMPLETED
        return brief

    def execute_full_pipeline(
        self, request: str, client_name: str = None
    ) -> ProjectBrief:
        """Full pipeline: analyze -> route to squads -> validate."""
        print(f"INFO: [GP] Starting pipeline for: {request[:80]}...")

        brief = self.analyze_request(request, client_name)
        print(
            f"INFO: [GP] Brief created: {brief.brief_id} | "
            f"Squads: {brief.squads_needed}"
        )

        brief = self.route_to_squads(brief)
        print(f"INFO: [GP] Squads completed. Contributions: {len(brief.contributions)}")

        brief = self.validate_brief(brief)
        print(f"INFO: [GP] Pipeline complete. Validation: {brief.gp_validation}")

        return brief

    def _aggregate_squad_outputs(self, brief: ProjectBrief):
        """Extract squad-specific fields from contributions."""
        for c in brief.contributions:
            if c.squad == "digital":
                if "copywriter" in c.agent:
                    if not brief.approved_copy:
                        brief.approved_copy = c.contribution[:500]
                elif "traffic" in c.agent or "trafego" in c.agent:
                    if not brief.strategy:
                        brief.strategy = c.contribution[:500]
                elif "social" in c.agent:
                    if not brief.tone_of_voice:
                        brief.tone_of_voice = c.contribution[:300]
                elif "sales_analyst" in c.agent or "vendas" in c.agent:
                    if not brief.cta:
                        brief.cta = c.contribution[:200]
            elif c.squad == "creative":
                if not brief.creative_direction:
                    brief.creative_direction = c.contribution[:500]
            elif c.squad == "tech":
                if not brief.tech_requirements:
                    brief.tech_requirements = c.contribution[:500]
            elif c.squad == "commercial":
                if not brief.sales_approach:
                    brief.sales_approach = c.contribution[:500]

    @staticmethod
    def _extract_field(text: str, field_name: str) -> str:
        """Extract a field value from structured LLM output."""
        lines = text.split("\n")
        collecting = False
        result_lines = []
        for line in lines:
            if line.strip().upper().startswith(f"{field_name.upper()}:"):
                value = line.split(":", 1)[1].strip()
                result_lines.append(value)
                collecting = True
            elif collecting:
                # Stop if we hit another field
                if any(
                    line.strip().upper().startswith(f"{f}:")
                    for f in [
                        "OBJETIVO",
                        "PUBLICO-ALVO",
                        "RESTRICOES",
                        "SQUADS_NECESSARIOS",
                        "ANALISE_ESTRATEGICA",
                        "VALIDACAO",
                        "COERENCIA",
                        "PONTOS_FORTES",
                        "GAPS",
                        "OUTPUT_FINAL",
                    ]
                ):
                    break
                result_lines.append(line)
        return "\n".join(result_lines).strip() if result_lines else ""
