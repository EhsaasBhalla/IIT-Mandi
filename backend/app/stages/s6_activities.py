from typing import List
from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage6_activities import Activity
from ..models.stage4_planner import TeachingPlan

class ActivityGenerationStage(BaseStage):
    """
    Stage 6: Generates differentiated interactive activities.
    """
    def execute(self, lesson_plan: TeachingPlan) -> List[Activity]:
        client = LLMClient()
        all_activities = []
        
        # We generate a pool of activities based on the lesson plan concepts
        all_concepts = []
        for period in lesson_plan.periods:
            all_concepts.extend(period.concepts_covered)
            
        # Deduplicate
        all_concepts = list(set(all_concepts))
        
        prompt = f"""
        Design 3 highly interactive classroom activities based on the following concepts:
        {', '.join(all_concepts)}
        
        For each activity, specify the title, instructions, time duration, resources, and success criteria.
        Make them engaging (e.g., Think-Pair-Share, Jigsaw, Lab simulation).
        """
        
        # In a real system, we'd use a schema that wraps List[Activity] or generate multiple.
        # Here we just generate one rich activity list.
        # Since Instructor needs a BaseModel, we'll create a dummy wrapper locally or just parse multiple.
        from pydantic import BaseModel
        class ActivityList(BaseModel):
            activities: List[Activity]
            
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=ActivityList,
            system_prompt = (
            "You are a master educator known for highly engaging, Cross-Disciplinary learning. "
            "For each activity, CRITICALLY link the core concept to an engaging real-world, cross-disciplinary hook "
            "(e.g., aerospace engineering, Olympic sports, historical events) rather than generic textbook examples."
        )
        )
        
        return result.activities
