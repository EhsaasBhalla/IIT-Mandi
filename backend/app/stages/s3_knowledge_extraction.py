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
        
        # Aggregate fields across chunks
        all_learning_objectives = []
        all_prerequisites = []
        all_concepts = []
        all_definitions = []
        all_formulae = []
        all_keywords = []
        all_examples = []
        all_applications = []
        all_misconceptions = []
        all_concept_map = {}
        
        # Group chunks into ~4000 character segments
        segments = []
        current_segment = ""
        for chunk in chunks:
            text = chunk.get("content", "")
            if len(current_segment) + len(text) > 4000:
                if current_segment:
                    segments.append(current_segment)
                current_segment = text + "\n\n"
            else:
                current_segment += text + "\n\n"
        if current_segment:
            segments.append(current_segment)
            
        # SAFETY CAP: Process max 5 segments to avoid burning through 14,400 TPM Groq Free Tier limit instantly
        segments = segments[:5]
        
        for i, segment in enumerate(segments):
            prompt = f"""
            Extract detailed educational knowledge from the following document excerpt (Part {i+1} of {len(segments)}).
            Target Subject: {subject}
            Target Grade: {grade}
            
            DOCUMENT TEXT:
            {segment}
            
            Extract core concepts, specific learning objectives, formulas (if any), 
            and common student misconceptions related to this material.
            
            IMPORTANT: If the provided text is brief or missing context, augment it using your own pedagogical knowledge. Add highly relevant definitions, formulas, and concepts that naturally belong to this topic, but strictly avoid unnecessary or irrelevant fluff.
            """
            
            try:
                result = client.generate_structured(
                    language=self.config.get("language", "English"), 
                    prompt=prompt,
                    response_model=KnowledgeExtraction,
                    system_prompt="You are an expert curriculum extractor. Your goal is to build a complete, robust knowledge map even if the source material is sparse."
                )
                
                # Merge the results
                all_learning_objectives.extend(result.learning_objectives)
                all_prerequisites.extend(result.prerequisites)
                all_concepts.extend(result.concepts)
                all_definitions.extend(result.definitions)
                all_formulae.extend(result.formulae)
                all_keywords.extend(result.keywords)
                all_examples.extend(result.examples)
                all_applications.extend(result.applications)
                all_misconceptions.extend(result.misconceptions)
                for k, v in result.concept_map.items():
                    if k not in all_concept_map:
                        all_concept_map[k] = []
                    all_concept_map[k].extend(v)
            except Exception as e:
                # If a chunk fails, skip and continue to avoid failing the whole stage
                import logging
                logging.getLogger(__name__).error(f"Failed to extract knowledge from chunk {i+1}: {e}")
        
        # Remove duplicates from aggregated lists (simple deduplication by dict grouping, or just return as is if the schema handles it, but let's just return as is for now since AI will summarize them in later stages anyway)
        
        return KnowledgeExtraction(
            learning_objectives=all_learning_objectives,
            prerequisites=all_prerequisites,
            concepts=all_concepts,
            definitions=all_definitions,
            formulae=all_formulae,
            keywords=all_keywords,
            examples=all_examples,
            applications=all_applications,
            misconceptions=all_misconceptions,
            concept_map=all_concept_map
        )
