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
    def execute(self, lesson_plan: TeachingPlan, status_callback=None) -> List[PeriodContent]:
        client = LLMClient()
        period_contents = []
        
        # Generate content for all periods in the lesson plan
        periods_to_generate = lesson_plan.periods if lesson_plan.periods else []
        
        total = len(periods_to_generate)
        for i, period in enumerate(periods_to_generate):
            if status_callback:
                status_callback(f"Stage 5: Generating Content ({i+1}/{total} periods)")
                
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
