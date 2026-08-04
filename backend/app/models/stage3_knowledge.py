from pydantic import BaseModel, Field, field_validator
from typing import List, Dict, Optional, Any

class LearningObjective(BaseModel):
    objective: str = Field(..., description="The learning objective")
    blooms_level: str = Field(default="Understand", description="Bloom's taxonomy level (e.g., Remember, Understand, Apply)")

class Prerequisite(BaseModel):
    concept: str = Field(..., description="Prerequisite concept")
    description: str = Field(default="", description="Description of the prerequisite")

class Concept(BaseModel):
    name: str = Field(..., description="Concept name")
    description: str = Field(default="", description="Description of the concept")

class Definition(BaseModel):
    term: str = Field(..., description="Term being defined")
    definition: str = Field(default="", description="The definition")

class Formula(BaseModel):
    name: str = Field(..., description="Name of the formula")
    latex: str = Field(default="", description="LaTeX representation")
    plain_text: str = Field(default="", description="Plain text representation")
    variables: Dict[str, str] = Field(default_factory=dict, description="Variables and their meanings")

class Keyword(BaseModel):
    word: str = Field(..., description="The keyword")
    context: str = Field(default="", description="Context in which it is used")

class Example(BaseModel):
    title: str = Field(..., description="Title of the example")
    content: str = Field(default="", description="Content of the example")

class Application(BaseModel):
    title: str = Field(..., description="Title of the application")
    description: str = Field(default="", description="Description of the real-world application")

class Misconception(BaseModel):
    misconception: str = Field(..., description="Common misconception")
    correction: str = Field(default="", description="Correction of the misconception")

class KnowledgeExtraction(BaseModel):
    learning_objectives: List[LearningObjective] = Field(default_factory=list, description="Learning objectives with Bloom's taxonomy")
    prerequisites: List[Prerequisite] = Field(default_factory=list, description="Prerequisite knowledge")
    concepts: List[Concept] = Field(default_factory=list, description="Key concepts")
    definitions: List[Definition] = Field(default_factory=list, description="Definitions of terms")
    formulae: List[Formula] = Field(default_factory=list, description="Formulae and equations")
    keywords: List[Keyword] = Field(default_factory=list, description="Important keywords")
    examples: List[Example] = Field(default_factory=list, description="Illustrative examples")
    applications: List[Application] = Field(default_factory=list, description="Real-world applications")
    misconceptions: List[Misconception] = Field(default_factory=list, description="Common misconceptions")
    concept_map: Dict[str, List[str]] = Field(default_factory=dict, description="Concept graph: node to list of related nodes")

    @field_validator('learning_objectives', mode='before')
    @classmethod
    def normalize_objectives(cls, v):
        if not isinstance(v, list): return []
        return [LearningObjective(objective=x, blooms_level="Understand") if isinstance(x, str) else x for x in v]

    @field_validator('prerequisites', mode='before')
    @classmethod
    def normalize_prereqs(cls, v):
        if not isinstance(v, list): return []
        return [Prerequisite(concept=x, description=x) if isinstance(x, str) else x for x in v]

    @field_validator('concepts', mode='before')
    @classmethod
    def normalize_concepts(cls, v):
        if not isinstance(v, list): return []
        return [Concept(name=x, description=x) if isinstance(x, str) else x for x in v]

    @field_validator('definitions', mode='before')
    @classmethod
    def normalize_defs(cls, v):
        if not isinstance(v, list): return []
        return [Definition(term=x, definition=x) if isinstance(x, str) else x for x in v]

    @field_validator('keywords', mode='before')
    @classmethod
    def normalize_keywords(cls, v):
        if not isinstance(v, list): return []
        return [Keyword(word=x, context=x) if isinstance(x, str) else x for x in v]

    @field_validator('examples', mode='before')
    @classmethod
    def normalize_examples(cls, v):
        if not isinstance(v, list): return []
        return [Example(title="Example", content=x) if isinstance(x, str) else x for x in v]

    @field_validator('applications', mode='before')
    @classmethod
    def normalize_applications(cls, v):
        if not isinstance(v, list): return []
        return [Application(title=x, description=x) if isinstance(x, str) else x for x in v]

    @field_validator('misconceptions', mode='before')
    @classmethod
    def normalize_misconceptions(cls, v):
        if not isinstance(v, list): return []
        return [Misconception(misconception=x, correction="Review concept") if isinstance(x, str) else x for x in v]
