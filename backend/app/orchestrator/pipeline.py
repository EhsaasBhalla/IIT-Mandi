from typing import Dict, Any
import logging
from ..stages.s1_document_intelligence import DocumentIntelligenceStage
from ..stages.s2_educational_classification import EducationalClassificationStage
from ..stages.s3_knowledge_extraction import KnowledgeExtractionStage

logger = logging.getLogger(__name__)

class PipelineOrchestrator:
    """
    Manages the sequential and parallel execution of the 10 stages.
    Emits progress events and handles cross-stage data flow.
    """
    def __init__(self, job_id: str, primary_file: str, reference_file: str = None, language: str = "English", file_hash: str = None):
        self.job_id = job_id
        self.primary_file = primary_file
        self.reference_file = reference_file
        self.language = language
        self.file_hash = file_hash
        self.state = {}
        
    def execute_phase_1(self) -> Dict[str, Any]:
        """Runs Stages 1-3 to build the foundational knowledge representation."""
        logger.info(f"Starting Phase 1 for document {self.job_id}")
        
        # Stage 1: Parse Document
        s1 = DocumentIntelligenceStage(self.job_id)
        doc_intel = s1.execute(self.primary_file, self.reference_file)
        self.state['doc_intel'] = doc_intel.model_dump()
        
        # Stage 2: Classify
        s2 = EducationalClassificationStage(self.job_id)
        classification = s2.execute(self.state['doc_intel'])
        self.state['classification'] = classification.model_dump()
        
        # [Curriculum Alignment would inject here in full version]
        
        # Stage 3: Extract Knowledge
        s3 = KnowledgeExtractionStage(self.job_id)
        knowledge = s3.execute(self.state['doc_intel'], self.state['classification'])
        self.state['knowledge'] = knowledge.model_dump()
        
        return self.state

    def execute_full(self) -> Dict[str, Any]:
        """Runs the entire 10-stage pipeline."""
        self.execute_phase_1()
        # Phases 2 and 3 will be implemented here
        return self.state
