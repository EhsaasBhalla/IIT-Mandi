from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage2_classification import EducationalClassification

class EducationalClassificationStage(BaseStage):
    """
    Stage 2: Determine subject, grade, difficulty, and topic based on document content.
    """
    def execute(self, doc_intel_result: dict) -> EducationalClassification:
        # We only need the first ~2000 tokens and the TOC to classify the document
        toc = doc_intel_result.get("table_of_contents", [])
        chunks = doc_intel_result.get("chunks", [])
        
        # Grab first few chunks for context
        intro_text = ""
        for chunk in chunks[:5]:
            intro_text += chunk.get("content", "") + "\n\n"
            
        prompt = f"""
        Analyze the following document excerpts and Table of Contents to determine its educational classification.
        
        TABLE OF CONTENTS:
        {chr(10).join(toc[:20])}
        
        INTRODUCTION EXCERPTS:
        {intro_text[:3000]}
        
        Extract the subject, target grade level, estimated difficulty, main topic, and Bloom's taxonomy focus.
        """
        
        client = LLMClient()
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=EducationalClassification,
            system_prompt="You are an expert curriculum designer. Classify the given educational document accurately."
        )
        
        return result
