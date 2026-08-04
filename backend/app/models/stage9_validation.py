from pydantic import BaseModel, Field
from typing import List, Dict

class ValidationFlag(BaseModel):
    flag_type: str = Field(..., description="Type of validation flag (e.g., 'Hallucination', 'Incompleteness')")
    description: str = Field(..., description="Description of the issue")
    severity: str = Field(..., description="Severity (e.g., 'Warning', 'Error')")
    location: str = Field(..., description="Where the issue was found (e.g., 'Stage 5 Content')")

class ValidationReport(BaseModel):
    is_valid: bool = Field(..., description="Overall validation status")
    completeness_score: float = Field(..., description="Completeness score (0-100)")
    consistency_score: float = Field(..., description="Consistency score (0-100)")
    hallucination_flags: List[ValidationFlag] = Field(..., description="Potential hallucinations detected")
    structural_flags: List[ValidationFlag] = Field(..., description="Structural or schema issues")
    time_validation: Dict[str, bool] = Field(..., description="Check if time allocations match totals")
