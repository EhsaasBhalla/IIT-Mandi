from pydantic import BaseModel, Field, field_validator
from typing import List, Union

class Activity(BaseModel):
    title: str = Field(default="Interactive Classroom Activity", description="Title of the activity")
    type: str = Field(default="Group Discussion", description="Type of activity")
    duration_minutes: int = Field(default=15, description="Duration in minutes")
    materials_needed: List[str] = Field(default_factory=list, description="List of required materials")
    teacher_instructions: List[str] = Field(default_factory=list, description="Instructions for the teacher")
    student_instructions: str = Field(default="", description="Instructions for the students")
    success_criteria: List[str] = Field(default_factory=list, description="Criteria for a successful activity")
    learning_objectives_addressed: List[str] = Field(default_factory=list, description="Objectives addressed by this activity")

    @field_validator('materials_needed', 'teacher_instructions', 'success_criteria', 'learning_objectives_addressed', mode='before')
    @classmethod
    def ensure_str_list(cls, v):
        if isinstance(v, str): return [v]
        if not isinstance(v, list): return []
        return [str(x) for x in v]
