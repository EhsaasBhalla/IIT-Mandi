from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any

class MCQ(BaseModel):
    question: str = Field(..., description="Question statement")
    options: List[str] = Field(default_factory=list, description="4 options (A, B, C, D)")
    correct_option: str = Field(default="A", description="Correct option letter")
    explanation: str = Field(default="", description="Explanation and distractor analysis")

    @field_validator('options', mode='before')
    @classmethod
    def ensure_options(cls, v):
        if isinstance(v, str): return [v]
        if not isinstance(v, list): return []
        return [str(x) for x in v]

class ShortAnswer(BaseModel):
    question: str = Field(..., description="Question text")
    model_answer: str = Field(default="", description="Model answer")
    key_points: List[str] = Field(default_factory=list, description="Key marking points")

class AssessmentVariant(BaseModel):
    title: str = Field(default="Assessment", description="Variant title")
    description: str = Field(default="", description="Focus of this variant")
    mcqs: List[MCQ] = Field(default_factory=list, description="MCQ questions")
    short_answer: List[ShortAnswer] = Field(default_factory=list, description="Short answer questions")
    rubric_guidelines: str = Field(default="", description="Marking rubric guidelines")

class ABTestAssessment(BaseModel):
    variant_a: AssessmentVariant = Field(default_factory=AssessmentVariant, description="Variant A (Direct/Recall)")
    variant_b: AssessmentVariant = Field(default_factory=AssessmentVariant, description="Variant B (Application/Analytical)")
    hypothesis: str = Field(default="Variant B tests higher-order thinking skills while Variant A tests foundational recall.", description="A/B testing hypothesis")
