from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AgentResponse(BaseModel):
    agent_name: str
    squad: str
    content: str
    model_used: str
    tokens_used: int = 0
    timestamp: datetime = Field(default_factory=datetime.now)
    error: Optional[str] = None
