from pydantic import BaseModel, Field
from typing import List, Optional

class LearningGap(BaseModel):
    concept: str = Field(default="Key Concept", description="The concept where the gap exists")
    misconception: str = Field(default="", description="The misconception")
    why_students_think_this: str = Field(default="", description="Reason for the misconception")
    diagnostic_question: str = Field(default="", description="Question to diagnose the gap")
    severity: str = Field(default="Medium", description="Severity of the gap (Low, Medium, High, Critical)")
    remedial_action: str = Field(default="", description="Action to remediate the gap")
    prerequisite_gap: Optional[str] = Field(None, description="Underlying prerequisite gap if any")

class GapAnalysisResult(BaseModel):
    gaps: List[LearningGap] = Field(default_factory=list, description="List of learning gaps")
