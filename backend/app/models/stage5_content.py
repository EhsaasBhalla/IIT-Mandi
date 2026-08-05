from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Any

class CriticReflection(BaseModel):
    critique: str = Field(default="Pedagogically sound and standard-compliant.", description="Teacher critique")
    pedagogical_alignment_score: int = Field(default=90, description="Score 0-100")
    revisions_made: str = Field(default="Refined clarity of key concepts.", description="Revisions made")

class EntryTicket(BaseModel):
    question: str = Field(default="What is the central concept of today's lesson?", description="Opening question")
    expected_answer: str = Field(default="Core concept definition.", description="Expected answer")

class ExitTicket(BaseModel):
    question: str = Field(default="Summarize the primary takeaway from this session.", description="Closing question")
    expected_answer: str = Field(default="Key concept summary.", description="Expected answer")

class Question(BaseModel):
    question: str = Field(..., description="Checkpoint question")
    answer: str = Field(default="", description="Answer")

class PeriodContent(BaseModel):
    period_number: int = Field(default=1, description="Period number")
    critic_reflection: CriticReflection = Field(default_factory=CriticReflection, description="Pedagogical reflection")
    entry_ticket: EntryTicket = Field(default_factory=EntryTicket, description="Entry ticket")
    teacher_script: str = Field(default="", description="Teacher lecture script and pacing guide")
    blackboard_notes: str = Field(default="", description="Blackboard/whiteboard diagram layout and summary notes")
    checkpoint_questions: List[Question] = Field(default_factory=list, description="Formative checkpoint questions")
    exit_ticket: ExitTicket = Field(default_factory=ExitTicket, description="Exit ticket")
    homework: List[str] = Field(default_factory=list, description="Homework tasks")
    mentor_moment: str = Field(default="Connect concepts to relatable real-world analogies.", description="Teaching tip")
    differentiation_advanced: List[str] = Field(default_factory=list, description="Advanced student tasks")
    differentiation_remedial: List[str] = Field(default_factory=list, description="Remedial student support")

    @field_validator('checkpoint_questions', mode='before')
    @classmethod
    def normalize_questions(cls, v):
        if not isinstance(v, list): return []
        return [Question(question=str(x), answer="") if isinstance(x, str) else x for x in v]

    @field_validator('homework', 'differentiation_advanced', 'differentiation_remedial', mode='before')
    @classmethod
    def ensure_str_list(cls, v):
        if isinstance(v, str): return [v]
        if not isinstance(v, list): return []
        return [str(x) for x in v]

    @field_validator('teacher_script', 'blackboard_notes', mode='before')
    @classmethod
    def coerce_to_str(cls, v):
        if isinstance(v, list):
            return "\n".join(str(x) for x in v)
        if isinstance(v, dict):
            return "\n".join(f"{k}: {val}" for k, val in v.items())
        return str(v)
