from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Any

class PeriodPlan(BaseModel):
    period_number: int = Field(..., description="Period sequence number")
    title: str = Field(..., description="Title of the period")
    learning_objectives: List[str] = Field(..., description="Objectives for this period")
    concepts_covered: List[str] = Field(..., description="Concepts covered in this period")
    time_allocation: Dict[str, int] = Field(..., description="Activity name to minutes")
    teaching_methodology: str = Field(..., description="Pedagogical approach")
    resources_needed: List[str] = Field(..., description="Resources required")

    @field_validator('learning_objectives', 'concepts_covered', 'resources_needed', mode='before')
    @classmethod
    def coerce_to_list(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return [str(x) for x in v]
        if isinstance(v, dict):
            return [str(val) for val in v.values()]
        if isinstance(v, str):
            return [v]
        return [str(v)] if v else []

class TeachingPlan(BaseModel):
    total_periods: int = Field(..., description="Total number of periods")
    period_duration_minutes: int = Field(..., description="Duration of each period in minutes")
    periods: List[PeriodPlan] = Field(..., description="Detailed plan for each period")
