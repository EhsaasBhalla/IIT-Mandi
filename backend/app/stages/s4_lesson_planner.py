from .base import BaseStage
from ..llm.client import LLMClient
from ..models.stage4_planner import TeachingPlan, PeriodPlan
from pydantic import BaseModel
from typing import List

class PeriodOutline(BaseModel):
    period_number: int
    title: str
    focus_concepts: List[str]
    focus_objectives: List[str]

class PlanOutline(BaseModel):
    periods: List[PeriodOutline]

class LessonPlannerStage(BaseStage):
    """
    Stage 4: Create a multi-period lesson plan using the extracted knowledge.
    Distributes objectives across multiple sessions and allocates timing.
    Chunked into 1+N API calls to completely avoid LLM token exhaustion.
    """
    def execute(self, classification: dict, knowledge: dict, start_index: int = 0, existing_outline: PlanOutline = None, on_period_complete=None, on_outline_complete=None, status_callback=None) -> TeachingPlan:
        # Extract metadata
        subject = classification.get("subject", "General")
        grade = classification.get("grade_level", "Unknown")
        est_hours = classification.get("estimated_teaching_hours", 2.0)
        
        # We assume 1 period = 45 minutes
        num_periods = max(1, int((est_hours * 60) / 45))
        
        # Summarize the knowledge for the prompt
        objectives = [obj.get("objective") for obj in knowledge.get("learning_objectives", [])]
        concepts = [c.get("name") for c in knowledge.get("concepts", [])]
        
        client = LLMClient()
        language = self.config.get("language", "English")
        
        # Phase 1: High-Level Outline Generation
        if existing_outline:
            outline_result = existing_outline
        else:
            if status_callback:
                status_callback("Stage 4: Planning Lessons (Generating Outline)", 25)
                
            outline_prompt = f"""
            You are an expert instructional designer. Create a high-level multi-period lesson plan outline.
            
            Subject: {subject}
            Grade Level: {grade}
            Estimated Periods (45 min each): {num_periods}
            
            Key Concepts to Cover:
            {', '.join(concepts)}
            
            Learning Objectives:
            {'; '.join(objectives)}
            
            Distribute these concepts and objectives logically across the {num_periods} periods. 
            Only return the title, focus concepts, and focus objectives for each period. Do not generate detailed methodologies yet.
            """
            
            outline_result = client.generate_structured(
                language=language, 
                prompt=outline_prompt,
                response_model=PlanOutline,
                system_prompt="You are an expert curriculum planner designing a high-level syllabus outline."
            )
            
            if on_outline_complete:
                on_outline_complete(outline_result)
        
        # Phase 2: Detailed Period Generation (Chunked)
        detailed_periods = []
        
        total = len(outline_result.periods)
        for i in range(start_index, total):
            p_outline = outline_result.periods[i]
            if status_callback:
                prog = 25 + int((i / total) * 15)
                status_callback(f"Stage 4: Planning Lessons ({i+1}/{total} periods)", prog)
                
            period_prompt = f"""
            You are an expert instructional designer. Generate the detailed lesson plan for a single 45-minute period.
            
            Subject: {subject}
            Grade Level: {grade}
            Period Number: {p_outline.period_number} of {num_periods}
            Period Title: {p_outline.title}
            
            Focus Concepts for this period:
            {', '.join(p_outline.focus_concepts)}
            
            Focus Objectives for this period:
            {'; '.join(p_outline.focus_objectives)}
            
            Design a comprehensive 45-minute period covering these specific concepts and objectives.
            Outline the time allocation (e.g., Introduction 5 min, Main Activity 30 min, Closure 10 min), 
            the teaching methodology, and any resources needed.
            """
            
            period_detail = client.generate_structured(
                language=language,
                prompt=period_prompt,
                response_model=PeriodPlan,
                system_prompt="You are an expert curriculum planner designing a detailed single-period lesson plan."
            )
            detailed_periods.append(period_detail)
            
            if on_period_complete:
                on_period_complete(period_detail)
            
        if status_callback:
            status_callback("Stage 4: Planning Lessons (Assembling)", 40)
            
        # Phase 3: Assembly
        return TeachingPlan(
            total_periods=num_periods,
            period_duration_minutes=45,
            periods=detailed_periods
        )
