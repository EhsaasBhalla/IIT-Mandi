from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage7_assessment import ABTestAssessment

class AssessmentGenerationStage(BaseStage):
    """
    Stage 7: Generate differentiated assessments (A/B variants).
    Variant A: Traditional structured assessment.
    Variant B: Application and scenario-based assessment.
    """
    def execute(self, knowledge: dict) -> ABTestAssessment:
        client = LLMClient()
        
        objectives = [obj.get("objective") for obj in knowledge.get("learning_objectives", []) if isinstance(obj, dict)]
        concepts = [c.get("name") if isinstance(c, dict) else str(c) for c in knowledge.get("concepts", [])]
        
        prompt = f"""
        Design an A/B tested assessment framework for the following objectives and concepts.
        Objectives: {', '.join(objectives[:4])}
        Concepts: {', '.join(concepts[:5])}
        
        Generate TWO variants:
        - Variant A: 2-3 standard MCQs with explanations, plus 1 short answer question.
        - Variant B: 2-3 application/scenario MCQs with explanations, plus 1 analytical short answer question.
        - Provide a hypothesis explaining the cognitive difference.
        """
        
        result = client.generate_structured(
            language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=ABTestAssessment,
            system_prompt="You are an expert psychometrician and assessment designer."
        )
        
        return result
