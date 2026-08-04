from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage9_validation import ValidationReport

class ValidationStage(BaseStage):
    """
    Stage 9: Quality Assurance & Hallucination Check.
    Validates that the generated lesson plans and assessments align with the original source document.
    """
    def execute(self, doc_intel: dict, generated_content: str) -> ValidationReport:
        client = LLMClient()
        
        # We take a sample of the raw text and the generated content for the LLM to cross-reference
        original_text = ""
        for chunk in doc_intel.get("chunks", [])[:10]: # First few chunks
            original_text += chunk.get("content", "") + " "
            
        prompt = f"""
        You are an AI Quality Assurance Engine. Your job is to detect hallucinations and ensure alignment.
        
        ORIGINAL SOURCE MATERIAL (Sample):
        {original_text[:4000]}
        
        GENERATED TKP CONTENT (Sample):
        {generated_content[:4000]}
        
        Cross-reference the generated content against the original source. 
        - Are there any facts in the generated content that contradict the source?
        - Are the time allocations realistic?
        - Is the content complete?
        
        Generate a strict ValidationReport.
        """
        
        result = client.generate_structured(language=self.config.get("language", "English"), 
            prompt=prompt,
            response_model=ValidationReport,
            system_prompt="You are a strict QA auditor detecting hallucinations."
        )
        
        return result
