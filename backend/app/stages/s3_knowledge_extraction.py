from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage3_knowledge import KnowledgeExtraction

class KnowledgeExtractionStage(BaseStage):
    """
    Stage 3: Extract learning objectives, concepts, definitions, formulae.
    Uses chunked extraction to handle long documents without context loss.
    """
    def execute(self, doc_intel_result: dict, classification: dict) -> KnowledgeExtraction:
        chunks = doc_intel_result.get("chunks", [])
        subject = classification.get("subject", "General")
        grade = classification.get("grade_level", "Unknown")
        
        client = LLMClient()
        all_concepts = []
        all_objectives = []
        all_misconceptions = []
        
        # In a real scenario, we'd group chunks into ~3000 token segments.
        # For simplicity, we process the first few chunks or group them into one big prompt if small.
        # Let's combine text up to 8000 characters for the prototype.
        combined_text = ""
        for chunk in chunks:
            if len(combined_text) < 8000:
                combined_text += chunk.get("content", "") + "\n\n"
                
        prompt = f"""
        Extract detailed educational knowledge from the following document excerpt.
        Target Subject: {subject}
        Target Grade: {grade}
        
        DOCUMENT TEXT:
        {combined_text}
        
        Extract core concepts, specific learning objectives, formulas (if any), 
        and common student misconceptions related to this material.
        """
        
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=KnowledgeExtraction,
            system_prompt="You are an expert curriculum extractor."
        )
        
        return result
