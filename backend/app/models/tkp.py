from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

from .stage1_doc_intel import DocumentIntelligenceOutput
from .stage2_classification import EducationalClassification
from .stage3_knowledge import KnowledgeExtraction
from .stage4_planner import TeachingPlan
from .stage5_content import PeriodContent
from .stage6_activities import Activity
from .stage7_assessment import ABTestAssessment
from .stage8_gap_analysis import LearningGap
from .stage9_validation import ValidationReport
from .stage10_publishing import PublishingFormat

class TeacherKnowledgePackage(BaseModel):
    id: str = Field(..., description="Unique ID for this TKP")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Creation timestamp")
    
    document_intelligence: DocumentIntelligenceOutput = Field(..., description="Stage 1 Output")
    classification: EducationalClassification = Field(..., description="Stage 2 Output")
    knowledge: KnowledgeExtraction = Field(..., description="Stage 3 Output")
    teaching_plan: TeachingPlan = Field(..., description="Stage 4 Output")
    
    period_contents: List[PeriodContent] = Field(default_factory=list, description="Stage 5 Output (per period)")
    all_activities: List[Activity] = Field(default_factory=list, description="Stage 6 Output (aggregated)")
    
    assessment: Optional[Any] = Field(None, description="Stage 7 Output")
    gap_analysis: List[LearningGap] = Field(default_factory=list, description="Stage 8 Output")
    
    validation: Optional[ValidationReport] = Field(None, description="Stage 9 Output")
    publishing: Optional[PublishingFormat] = Field(None, description="Stage 10 Output")
