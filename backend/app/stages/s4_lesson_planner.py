from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage4_planner import TeachingPlan

class LessonPlannerStage(BaseStage):
    """
    Stage 4: Create a multi-period lesson plan using the extracted knowledge.
    Distributes objectives across multiple sessions and allocates timing.
    """
    def execute(self, classification: dict, knowledge: dict) -> TeachingPlan:
        # Extract metadata
        subject = classification.get("subject", "General")
        grade = classification.get("grade_level", "Unknown")
        est_hours = classification.get("estimated_teaching_hours", 2.0)
        
        # We assume 1 period = 45 minutes
        num_periods = max(1, int((est_hours * 60) / 45))
        
        # Summarize the knowledge for the prompt
        objectives = [obj.get("objective") for obj in knowledge.get("learning_objectives", [])]
        concepts = [c.get("name") for c in knowledge.get("concepts", [])]
        
        system_prompt = (
            "You are an expert curriculum planner. Design a logical, multi-period teaching sequence. "
            "CRITICAL: Map the lesson plan to standard educational curriculum frameworks (e.g., NCERT, CBSE, Common Core) where applicable, "
            "ensuring the structure strictly follows official pedagogical pacing."
        )
        
        prompt = f"""
        You are an expert instructional designer. Create a comprehensive multi-period lesson plan.
        
        Subject: {subject}
        Grade Level: {grade}
        Estimated Periods (45 min each): {num_periods}
        
        Key Concepts to Cover:
        {', '.join(concepts)}
        
        Learning Objectives:
        {'; '.join(objectives)}
        
        Distribute these concepts and objectives logically across the {num_periods} periods. 
        For each period, outline the timing for Introduction, Main Activity, and Closure.
        """
        
        client = LLMClient()
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=TeachingPlan,
            system_prompt="You are an expert curriculum planner and instructional designer."
        )
        
        return result
