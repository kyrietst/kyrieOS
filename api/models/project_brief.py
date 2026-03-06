from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BriefStatus(str, Enum):
    CREATED = "created"
    IN_ANALYSIS = "in_analysis"
    SQUAD_DIGITAL = "squad_digital"
    SQUAD_CREATIVE = "squad_creative"
    SQUAD_TECH = "squad_tech"
    SQUAD_COMMERCIAL = "squad_commercial"
    GP_REVIEW = "gp_review"
    CLEVEL_REVIEW = "clevel_review"
    AWAITING_GILMAR = "awaiting_gilmar"
    COMPLETED = "completed"


class SquadContribution(BaseModel):
    squad: str
    agent: str
    contribution: str
    timestamp: datetime = Field(default_factory=datetime.now)


class ProjectBrief(BaseModel):
    # Identification
    brief_id: str
    created_at: datetime = Field(default_factory=datetime.now)
    status: BriefStatus = BriefStatus.CREATED

    # Original demand
    original_request: str
    client_name: Optional[str] = None

    # Filled by Gestor de Projetos
    objective: Optional[str] = None
    target_audience: Optional[str] = None
    constraints: Optional[str] = None
    squads_needed: List[str] = []
    strategic_analysis: Optional[str] = None

    # Filled by Squad Digital
    strategy: Optional[str] = None
    approved_copy: Optional[str] = None
    tone_of_voice: Optional[str] = None
    cta: Optional[str] = None

    # Filled by Squad Criativo
    creative_direction: Optional[str] = None
    visual_references: Optional[str] = None
    creative_assets: Optional[str] = None

    # Filled by Squad Tech
    tech_requirements: Optional[str] = None
    tech_config: Optional[str] = None

    # Filled by Squad Comercial
    sales_approach: Optional[str] = None
    sales_script: Optional[str] = None

    # Full contribution history
    contributions: List[SquadContribution] = []

    # Final output
    final_output: Optional[str] = None
    gp_validation: Optional[str] = None
    clevel_notes: Optional[str] = None

    def add_contribution(self, squad: str, agent: str, contribution: str):
        self.contributions.append(
            SquadContribution(squad=squad, agent=agent, contribution=contribution)
        )

    def get_brief_summary(self) -> str:
        """Serializes the current brief state for LLM context."""
        parts = [f"DEMANDA ORIGINAL: {self.original_request}"]
        if self.client_name:
            parts.append(f"CLIENTE: {self.client_name}")
        if self.objective:
            parts.append(f"OBJETIVO: {self.objective}")
        if self.target_audience:
            parts.append(f"PUBLICO-ALVO: {self.target_audience}")
        if self.constraints:
            parts.append(f"RESTRICOES: {self.constraints}")
        if self.strategic_analysis:
            parts.append(f"ANALISE ESTRATEGICA (GP): {self.strategic_analysis}")
        if self.strategy:
            parts.append(f"ESTRATEGIA DIGITAL: {self.strategy}")
        if self.approved_copy:
            parts.append(f"COPY APROVADA: {self.approved_copy}")
        if self.tone_of_voice:
            parts.append(f"TOM DE VOZ: {self.tone_of_voice}")
        if self.cta:
            parts.append(f"CTA: {self.cta}")
        if self.creative_direction:
            parts.append(f"DIRECAO CRIATIVA: {self.creative_direction}")
        if self.visual_references:
            parts.append(f"REFERENCIAS VISUAIS: {self.visual_references}")
        if self.tech_requirements:
            parts.append(f"REQUISITOS TECH: {self.tech_requirements}")
        if self.sales_approach:
            parts.append(f"ABORDAGEM COMERCIAL: {self.sales_approach}")
        for c in self.contributions:
            parts.append(f"[{c.squad}/{c.agent}]: {c.contribution[:300]}")
        return "\n".join(parts)
