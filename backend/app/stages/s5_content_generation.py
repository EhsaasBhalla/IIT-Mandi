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
    def execute(self, lesson_plan: TeachingPlan, start_index: int = 0, on_period_complete=None, status_callback=None) -> List[PeriodContent]:
        client = LLMClient()
        period_contents = []
        
        # Generate content for all periods in the lesson plan
        periods_to_generate = lesson_plan.periods if lesson_plan.periods else []
        total = len(periods_to_generate)
        
        for i in range(start_index, total):
            period = periods_to_generate[i]
            if status_callback:
                prog = 40 + int((i / total) * 10)
                status_callback(f"Stage 5: Generating Content ({i+1}/{total} periods)", prog)
                
            system_prompt = (
                "You are a Senior Curriculum Designer. Output ONLY the requested JSON data. "
                "CRITICAL: Your output MUST be extremely concise to fit within strict token limits. "
                "Limit your teacher script to 2 short paragraphs. Limit arrays (questions, homework) to 2 items max."
            )
            prompt = f"""
            Generate instructional materials for Period {period.period_number}.
            Title: {period.title}
            
            Objectives:
            {', '.join(str(o) for o in period.learning_objectives)}
            
            Concepts to Cover:
            {', '.join(str(c) for c in period.concepts_covered)}
            
            Methodology: {period.teaching_methodology}
            
            IMPORTANT: Add relevant real-world examples, but KEEP IT VERY BRIEF. 
            CRITICAL LENGTH LIMITS (Violating these will crash the system):
            - teacher_script: MAX 150 words.
            - blackboard_notes: MAX 50 words.
            - checkpoint_questions: MAX 2 items.
            - homework: MAX 2 items.
            
            CRITICAL FORMATTING INSTRUCTION: For fields like `teacher_script` and `blackboard_notes` which expect a string, you MUST output a single continuous string (use \\n for line breaks). Do NOT output a nested JSON object or dictionary for these fields, otherwise the JSON validation will fail!
            """
            
            result = client.generate_structured(
                language=self.config.get("language", "English"), 
                prompt=prompt,
                response_model=PeriodContent,
                system_prompt=system_prompt
            )
            period_contents.append(result)
            
            if on_period_complete:
                on_period_complete(result)
            
        return period_contents
