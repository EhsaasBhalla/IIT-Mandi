from typing import List
from pydantic import BaseModel
from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage8_gap_analysis import LearningGap

class GapAnalysisResult(BaseModel):
    gaps: List[LearningGap]

class GapAnalysisStage(BaseStage):
    """
    Stage 8: Identify student misconceptions and generate diagnostic/remedial tools.
    """
    def execute(self, knowledge: dict) -> GapAnalysisResult:
        client = LLMClient()
        
        misconceptions = []
        for m in knowledge.get("misconceptions", []):
            misconceptions.append(f"- {m.get('misconception')}: {m.get('correction')}")
            
        concepts = [c.get("name") for c in knowledge.get("concepts", [])]
        
        prompt = f"""
        You are an expert pedagogical diagnostician. Analyze potential learning gaps for these concepts:
        {', '.join(concepts)}
        
        Some known misconceptions identified earlier:
        {chr(10).join(misconceptions) if misconceptions else 'None specifically identified.'}
        
        For the core concepts, provide a detailed gap analysis identifying:
        1. The misconception
        2. Why students think this
        3. A diagnostic question to catch it
        4. Remedial action
        """
        
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=GapAnalysisResult,
            system_prompt="You are an expert in student psychology and pedagogy."
        )
        
        return result
