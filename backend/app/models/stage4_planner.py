from pydantic import BaseModel, Field
from typing import List, Dict

class PeriodPlan(BaseModel):
    period_number: int = Field(..., description="Period sequence number")
    title: str = Field(..., description="Title of the period")
    learning_objectives: List[str] = Field(..., description="Objectives for this period")
    concepts_covered: List[str] = Field(..., description="Concepts covered in this period")
    time_allocation: Dict[str, int] = Field(..., description="Activity name to minutes")
    teaching_methodology: str = Field(..., description="Pedagogical approach")
    resources_needed: List[str] = Field(..., description="Resources required")

class TeachingPlan(BaseModel):
    total_periods: int = Field(..., description="Total number of periods")
    period_duration_minutes: int = Field(..., description="Duration of each period in minutes")
    periods: List[PeriodPlan] = Field(..., description="Detailed plan for each period")
