from pydantic import BaseModel, Field
from typing import List, Optional, Any

class Section(BaseModel):
    id: str = Field(..., description="Unique identifier for the section")
    title: str = Field(..., description="Section title")
    level: int = Field(..., description="Heading level (e.g., 1 for H1, 2 for H2)")
    content: str = Field(..., description="Text content of the section")
    children: List['Section'] = Field(default_factory=list, description="Child subsections")

class Table(BaseModel):
    id: str = Field(..., description="Unique identifier for the table")
    caption: Optional[str] = Field(None, description="Table caption")
    markdown_content: str = Field(..., description="Table content represented in markdown")

class Equation(BaseModel):
    id: str = Field(..., description="Unique identifier for the equation")
    latex: str = Field(..., description="LaTeX representation of the equation")
    inline: bool = Field(False, description="True if inline equation, false if block")

class FigureRef(BaseModel):
    id: str = Field(..., description="Unique identifier for the figure")
    caption: Optional[str] = Field(None, description="Figure caption")
    path: Optional[str] = Field(None, description="Path or reference to the extracted image")

class DocumentMetadata(BaseModel):
    page_count: Optional[int] = Field(None, description="Total number of pages")
    word_count: Optional[int] = Field(None, description="Total word count")
    language: Optional[str] = Field(None, description="Language of the document")
    author: Optional[str] = Field(None, description="Document author")

class DocumentIntelligenceOutput(BaseModel):
    title: str = Field(..., description="Document title")
    sections: List[Section] = Field(..., description="Hierarchical sections of the document")
    tables: List[Table] = Field(..., description="Extracted tables")
    equations: List[Equation] = Field(..., description="Extracted equations")
    figures: List[FigureRef] = Field(..., description="Extracted figures and image references")
    metadata: DocumentMetadata = Field(..., description="Metadata of the document")
    raw_text: str = Field(..., description="Fallback full raw text of the document")

Section.update_forward_refs()
