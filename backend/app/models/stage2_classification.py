from pydantic import BaseModel, Field
from typing import List, Optional, Literal

class EducationalClassification(BaseModel):
    subject: str = Field(..., description='e.g., "Physics"')
    sub_subject: str = Field(..., description='e.g., "Mechanics"')
    grade_level: str = Field(..., description='e.g., "Grade 10"')
    difficulty: Literal["Beginner", "Intermediate", "Advanced"] = Field(..., description="Difficulty level")
    topic: str = Field(..., description="Main topic")
    chapter: Optional[str] = Field(None, description="Chapter name if applicable")
    category: Literal["Textbook", "Research Paper", "Lecture Notes", "Reference"] = Field(..., description="Type of document")
    language: str = Field(..., description="Language of the document")
    board_alignment: List[str] = Field(default_factory=list, description='e.g., ["CBSE", "Common Core"]')
    estimated_teaching_hours: float = Field(..., description="Estimated hours to teach this content")
