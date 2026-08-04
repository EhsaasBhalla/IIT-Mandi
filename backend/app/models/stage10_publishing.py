from pydantic import BaseModel, Field
from typing import List

class PDFConfig(BaseModel):
    template: str = Field(..., description="PDF template to use")
    include_answers: bool = Field(False, description="Whether to include answer keys")
    branding: str = Field(..., description="Branding configuration")

class PublishingFormat(BaseModel):
    lesson_plan_pdf: PDFConfig = Field(..., description="Config for Lesson Plan PDF")
    teacher_guide_pdf: PDFConfig = Field(..., description="Config for Teacher Guide PDF")
    assessment_book_pdf: PDFConfig = Field(..., description="Config for Assessment Book PDF")
    export_json: bool = Field(True, description="Whether to export raw JSON")
