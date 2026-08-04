from typing import List
from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage4_planner import TeachingPlan
from ..models.stage5_content import PeriodContent

class ContentGenerationStage(BaseStage):
    """
    Stage 5: Generate detailed instructional materials (scripts, blackboard notes,
    entry/exit tickets) for each period in the lesson plan.
    """
    def execute(self, lesson_plan: TeachingPlan) -> List[PeriodContent]:
        client = LLMClient()
        period_contents = []
        
        # Limit to first 2 periods for fast generation and staying under token limits
        periods_to_generate = lesson_plan.periods[:2] if lesson_plan.periods else []
        
        for period in periods_to_generate:
            system_prompt = (
                "You are a Senior Curriculum Designer and Veteran Teacher operating in a Critic-Creator loop. "
                "Provide a brief pedagogical critique reflection, then create the detailed instructional content: "
                "entry ticket, detailed teacher script, blackboard notes, checkpoint questions, exit ticket, and homework."
            )
            prompt = f"""
            Generate instructional materials for Period {period.period_number}.
            Title: {period.title}
            Methodology: {period.teaching_methodology}
            Concepts: {', '.join(period.concepts_covered[:4])}
            """
            
            result = client.generate_structured(
                language=self.config.get("language", "English"), 
                prompt=prompt,
                response_model=PeriodContent,
                system_prompt=system_prompt
            )
            period_contents.append(result)
            
        return period_contents
