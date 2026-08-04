import os
import json
import logging
from fpdf import FPDF
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from pptx import Presentation
from pptx.util import Inches as PptxInches, Pt as PptxPt, Emu
from pptx.dml.color import RGBColor as PptxRGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from .base import BaseStage
from ..config import Config

logger = logging.getLogger(__name__)


# ═══════════════════════════════════════════════════════
# PDF REPORT (fpdf2)
# ═══════════════════════════════════════════════════════
class PDFReport(FPDF):
    def header(self):
        self.set_font('Helvetica', 'B', 10)
        self.set_text_color(100, 116, 139)
        self.cell(0, 8, 'Teacher Knowledge Package (TKP) | AI Platform', 0, 1, 'R')
        self.ln(2)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(148, 163, 184)
        self.cell(0, 10, f'Page {self.page_no()}/{{nb}}', 0, 0, 'C')


def _safe(text, maxlen=2000):
    """Sanitize text for PDF — replace unsupported chars."""
    if not text:
        return ""
    text = str(text)[:maxlen]
    return text.encode('latin-1', errors='replace').decode('latin-1')


def generate_pdf(state: dict, out_path: str):
    """Generate a comprehensive multi-page PDF report from the TKP state."""
    pdf = PDFReport()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    classification = state.get("classification", {})
    knowledge = state.get("knowledge", {})
    lesson_plan = state.get("lesson_plan", {})
    period_contents = state.get("period_contents", [])
    activities = state.get("activities", [])
    assessments = state.get("ab_test_assessment", {})
    gap_data = state.get("gap_analysis", {})
    validation = state.get("validation", {})

    subject = classification.get("subject", "General Curriculum")
    topic = classification.get("topic", "Teacher Knowledge Package")
    grade = classification.get("target_grade", classification.get("grade_level", "K-12"))
    board = classification.get("curriculum_board", "CBSE/NCERT")

    def section_header(title):
        pdf.set_font('Helvetica', 'B', 14)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 9, _safe(title), 0, 1, 'L')
        pdf.set_draw_color(56, 189, 248)
        pdf.set_line_width(0.5)
        pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
        pdf.ln(3)

    # ── COVER ──
    pdf.set_font('Helvetica', 'B', 22)
    pdf.set_text_color(30, 58, 138)
    pdf.cell(0, 14, _safe(f"{subject}: {topic}"), 0, 1, 'L')
    pdf.set_font('Helvetica', '', 11)
    pdf.set_text_color(71, 85, 105)
    total_periods = lesson_plan.get("total_periods", len(period_contents) or 3)
    pdf.cell(0, 7, _safe(f"Grade {grade}  |  Board: {board}  |  {total_periods} Teaching Periods"), 0, 1, 'L')
    pdf.ln(6)

    # ── 1. Learning Objectives ──
    objs = knowledge.get("learning_objectives", [])
    if objs:
        section_header("1. Core Learning Objectives")
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(30, 41, 59)
        for o in objs:
            text = o if isinstance(o, str) else o.get("objective", str(o))
            bloom = "" if isinstance(o, str) else o.get("blooms_level", "")
            line = f"  * {text}"
            if bloom:
                line += f"  [Bloom: {bloom}]"
            pdf.multi_cell(0, 5, _safe(line))
        pdf.ln(3)

    # ── 2. Key Concepts & Definitions ──
    concepts = knowledge.get("concepts", [])
    definitions = knowledge.get("definitions", [])
    formulae = knowledge.get("formulae", [])
    if concepts or definitions:
        section_header("2. Key Concepts, Definitions & Formulae")
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(30, 41, 59)
        for c in concepts:
            name = c if isinstance(c, str) else c.get("name", "")
            desc = "" if isinstance(c, str) else c.get("description", "")
            pdf.multi_cell(0, 5, _safe(f"  * {name}: {desc}"))
        for d in definitions:
            term = d if isinstance(d, str) else d.get("term", "")
            defn = "" if isinstance(d, str) else d.get("definition", "")
            pdf.multi_cell(0, 5, _safe(f"  * {term}: {defn}"))
        if formulae:
            pdf.ln(1)
            pdf.set_font('Helvetica', 'B', 10)
            pdf.cell(0, 6, "Formulae:", 0, 1, 'L')
            pdf.set_font('Courier', '', 9)
            for f in formulae:
                name = f if isinstance(f, str) else f.get("name", "")
                expr = "" if isinstance(f, str) else (f.get("latex", "") or f.get("plain_text", ""))
                pdf.multi_cell(0, 5, _safe(f"  {name}: {expr}"))
        pdf.ln(4)

    # ── 3. Lesson Plan ──
    periods = lesson_plan.get("periods", [])
    if periods:
        section_header("3. Multi-Period Lesson Plan")
        for p in periods:
            p_num = p.get("period_number", 1)
            p_title = p.get("title", f"Period {p_num}")
            pdf.set_font('Helvetica', 'B', 10.5)
            pdf.set_text_color(30, 58, 138)
            pdf.cell(0, 6, _safe(f"Period {p_num}: {p_title}"), 0, 1, 'L')
            pdf.set_font('Helvetica', '', 9.5)
            pdf.set_text_color(51, 65, 85)
            objectives_list = p.get("learning_objectives", [])
            if objectives_list:
                pdf.multi_cell(0, 5, _safe(f"Objectives: {', '.join(str(o) for o in objectives_list)}"))
            pdf.multi_cell(0, 5, _safe(f"Methodology: {p.get('teaching_methodology', '')}"))
            concepts_covered = p.get("concepts_covered", [])
            if concepts_covered:
                pdf.multi_cell(0, 5, _safe(f"Concepts: {', '.join(str(c) for c in concepts_covered)}"))
            pdf.ln(2)

    # ── 4. Teacher Scripts ──
    if period_contents:
        section_header("4. Teacher Delivery Scripts")
        for pc in period_contents:
            p_num = pc.get("period_number", 1)
            pdf.set_font('Helvetica', 'B', 10.5)
            pdf.set_text_color(15, 23, 42)
            pdf.cell(0, 6, _safe(f"Period {p_num}:"), 0, 1, 'L')

            # Entry ticket
            entry = pc.get("entry_ticket", {})
            if entry and entry.get("question"):
                pdf.set_font('Helvetica', 'BI', 9)
                pdf.set_text_color(99, 102, 241)
                pdf.multi_cell(0, 5, _safe(f"Entry Ticket: {entry['question']}"))

            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(51, 65, 85)
            script = pc.get("teacher_script", "")
            pdf.multi_cell(0, 4.5, _safe(script, 1200))
            pdf.ln(1)

            bb = pc.get("blackboard_notes", "")
            if bb:
                pdf.set_font('Courier', '', 8.5)
                pdf.multi_cell(0, 4, _safe(f"Board Notes: {bb}", 600))

            exit_t = pc.get("exit_ticket", {})
            if exit_t and exit_t.get("question"):
                pdf.set_font('Helvetica', 'BI', 9)
                pdf.set_text_color(234, 88, 12)
                pdf.multi_cell(0, 5, _safe(f"Exit Ticket: {exit_t['question']}"))
            pdf.ln(3)

    # ── 5. Activities ──
    if activities:
        section_header("5. Classroom Activities")
        for act in activities:
            title = act.get("title", "Activity")
            pdf.set_font('Helvetica', 'B', 10)
            pdf.set_text_color(30, 58, 138)
            pdf.cell(0, 6, _safe(f"* {title} ({act.get('duration_minutes', 15)} mins, {act.get('type', 'Interactive')})"), 0, 1, 'L')
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(51, 65, 85)
            student_inst = act.get("student_instructions", "")
            teacher_inst = act.get("teacher_instructions", [])
            if student_inst:
                pdf.multi_cell(0, 4.5, _safe(f"Student Instructions: {student_inst}"))
            if teacher_inst:
                pdf.multi_cell(0, 4.5, _safe(f"Teacher Guidance: {'; '.join(str(t) for t in teacher_inst)}"))
            materials = act.get("materials_needed", [])
            if materials:
                pdf.multi_cell(0, 4.5, _safe(f"Materials: {', '.join(str(m) for m in materials)}"))
            pdf.ln(2)

    # ── 6. Assessments ──
    section_header("6. A/B Test Assessments")
    for var_key, var_label in [("variant_a", "Variant A (Standard)"), ("variant_b", "Variant B (Deep Reasoning)")]:
        variant = assessments.get(var_key, {})
        pdf.set_font('Helvetica', 'B', 10)
        pdf.set_text_color(15, 23, 42)
        pdf.cell(0, 6, _safe(var_label), 0, 1, 'L')
        pdf.set_font('Helvetica', '', 9)
        pdf.set_text_color(51, 65, 85)

        mcqs = variant.get("mcqs", [])
        for i, q in enumerate(mcqs):
            pdf.multi_cell(0, 4.5, _safe(f"Q{i+1}. {q.get('question', '')}"))
            for oIdx, opt in enumerate(q.get("options", [])):
                pdf.multi_cell(0, 4.5, _safe(f"   ({chr(65+oIdx)}) {opt}"))
            pdf.set_text_color(16, 185, 129)
            pdf.multi_cell(0, 4.5, _safe(f"   Answer: {q.get('correct_option', '')} — {q.get('explanation', '')}"))
            pdf.set_text_color(51, 65, 85)

        short_ans = variant.get("short_answer", [])
        for i, q in enumerate(short_ans):
            pdf.multi_cell(0, 4.5, _safe(f"Q{i+1}. {q.get('question', '')}"))
            pdf.set_text_color(16, 185, 129)
            pdf.multi_cell(0, 4.5, _safe(f"   Model Answer: {q.get('model_answer', '')}"))
            pdf.set_text_color(51, 65, 85)
        pdf.ln(2)

    # ── 7. Gap Analysis ──
    gaps_list = gap_data.get("gaps", [])
    if gaps_list:
        section_header("7. Learning Gap Analysis & Remediation")
        for g in gaps_list:
            pdf.set_font('Helvetica', 'B', 9.5)
            pdf.set_text_color(220, 38, 38)
            pdf.cell(0, 5, _safe(f"Gap: {g.get('concept', '')} — {g.get('misconception', '')}"), 0, 1, 'L')
            pdf.set_font('Helvetica', '', 9)
            pdf.set_text_color(51, 65, 85)
            if g.get("why_students_think_this"):
                pdf.multi_cell(0, 4.5, _safe(f"Root Cause: {g['why_students_think_this']}"))
            if g.get("diagnostic_question"):
                pdf.multi_cell(0, 4.5, _safe(f"Diagnostic: {g['diagnostic_question']}"))
            if g.get("remedial_action"):
                pdf.set_text_color(16, 185, 129)
                pdf.multi_cell(0, 4.5, _safe(f"Remediation: {g['remedial_action']}"))
                pdf.set_text_color(51, 65, 85)
            pdf.multi_cell(0, 4.5, _safe(f"Severity: {g.get('severity', 'Medium')}"))
            pdf.ln(2)

    # ── 8. Validation Summary ──
    if validation:
        section_header("8. Quality Validation Report")
        pdf.set_font('Helvetica', '', 9.5)
        pdf.set_text_color(30, 41, 59)
        pdf.multi_cell(0, 5, _safe(f"Overall Score: {validation.get('overall_score', 'N/A')}/100"))
        pdf.multi_cell(0, 5, _safe(f"Hallucination Flags: {validation.get('hallucination_flags', 0)}"))
        issues = validation.get("issues", [])
        if issues:
            for issue in issues:
                if isinstance(issue, str):
                    pdf.multi_cell(0, 5, _safe(f"  - {issue}"))
                elif isinstance(issue, dict):
                    pdf.multi_cell(0, 5, _safe(f"  - {issue.get('description', str(issue))}"))
        pdf.ln(3)

    pdf.output(out_path)


# ═══════════════════════════════════════════════════════
# DOCX REPORT (python-docx)
# ═══════════════════════════════════════════════════════
def generate_docx(state: dict, out_path: str):
    """Generate a comprehensive DOCX Teacher Guide from TKP state."""
    doc = Document()

    classification = state.get("classification", {})
    knowledge = state.get("knowledge", {})
    lesson_plan = state.get("lesson_plan", {})
    period_contents = state.get("period_contents", [])
    activities = state.get("activities", [])
    assessments = state.get("ab_test_assessment", {})
    gap_data = state.get("gap_analysis", {})
    validation = state.get("validation", {})

    subject = classification.get("subject", "General Curriculum")
    topic = classification.get("topic", "Teacher Knowledge Package")
    grade = classification.get("target_grade", classification.get("grade_level", "K-12"))
    board = classification.get("curriculum_board", "CBSE/NCERT")
    total_periods = lesson_plan.get("total_periods", len(period_contents) or 3)

    # ── Title ──
    title = doc.add_heading(f"{subject}: {topic}", level=0)
    title.alignment = WD_ALIGN_PARAGRAPH.LEFT
    subtitle = doc.add_paragraph(f"Grade {grade}  |  Board: {board}  |  {total_periods} Teaching Periods")
    subtitle.style.font.color.rgb = RGBColor(100, 116, 139)
    doc.add_paragraph("")

    # ── 1. Learning Objectives ──
    objs = knowledge.get("learning_objectives", [])
    if objs:
        doc.add_heading("1. Core Learning Objectives", level=1)
        for o in objs:
            text = o if isinstance(o, str) else o.get("objective", str(o))
            bloom = "" if isinstance(o, str) else o.get("blooms_level", "")
            p = doc.add_paragraph(text, style='List Bullet')
            if bloom:
                run = p.add_run(f"  [Bloom: {bloom}]")
                run.italic = True
                run.font.color.rgb = RGBColor(99, 102, 241)

    # ── 2. Key Concepts ──
    concepts = knowledge.get("concepts", [])
    definitions = knowledge.get("definitions", [])
    formulae = knowledge.get("formulae", [])
    if concepts or definitions:
        doc.add_heading("2. Key Concepts, Definitions & Formulae", level=1)
        if concepts:
            for c in concepts:
                name = c if isinstance(c, str) else c.get("name", "")
                desc = "" if isinstance(c, str) else c.get("description", "")
                p = doc.add_paragraph(style='List Bullet')
                run = p.add_run(f"{name}: ")
                run.bold = True
                p.add_run(str(desc))
        if definitions:
            for d in definitions:
                term = d if isinstance(d, str) else d.get("term", "")
                defn = "" if isinstance(d, str) else d.get("definition", "")
                p = doc.add_paragraph(style='List Bullet')
                run = p.add_run(f"{term}: ")
                run.bold = True
                p.add_run(str(defn))
        if formulae:
            doc.add_heading("Formulae", level=2)
            for f in formulae:
                name = f if isinstance(f, str) else f.get("name", "")
                expr = "" if isinstance(f, str) else (f.get("latex", "") or f.get("plain_text", ""))
                p = doc.add_paragraph(style='List Bullet')
                run = p.add_run(f"{name}:  ")
                run.bold = True
                run2 = p.add_run(str(expr))
                run2.font.name = "Courier New"

    # ── 3. Lesson Plan ──
    periods = lesson_plan.get("periods", [])
    if periods:
        doc.add_heading("3. Multi-Period Lesson Plan", level=1)
        # Summary table
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Light Grid Accent 1'
        hdr = table.rows[0].cells
        hdr[0].text = "Period"
        hdr[1].text = "Title"
        hdr[2].text = "Objectives"
        hdr[3].text = "Methodology"
        for p in periods:
            row = table.add_row().cells
            row[0].text = str(p.get("period_number", 1))
            row[1].text = str(p.get("title", ""))
            row[2].text = ", ".join(str(o) for o in p.get("learning_objectives", []))
            row[3].text = str(p.get("teaching_methodology", ""))
        doc.add_paragraph("")

    # ── 4. Teacher Scripts ──
    if period_contents:
        doc.add_heading("4. Teacher Delivery Scripts", level=1)
        for pc in period_contents:
            p_num = pc.get("period_number", 1)
            doc.add_heading(f"Period {p_num}", level=2)

            entry = pc.get("entry_ticket", {})
            if entry and entry.get("question"):
                p = doc.add_paragraph()
                run = p.add_run("Entry Ticket: ")
                run.bold = True
                run.font.color.rgb = RGBColor(99, 102, 241)
                p.add_run(str(entry["question"]))

            script = pc.get("teacher_script", "")
            if script:
                doc.add_paragraph(str(script))

            bb = pc.get("blackboard_notes", "")
            if bb:
                p = doc.add_paragraph()
                run = p.add_run("Blackboard Notes: ")
                run.bold = True
                p.add_run(str(bb))

            exit_t = pc.get("exit_ticket", {})
            if exit_t and exit_t.get("question"):
                p = doc.add_paragraph()
                run = p.add_run("Exit Ticket: ")
                run.bold = True
                run.font.color.rgb = RGBColor(234, 88, 12)
                p.add_run(str(exit_t["question"]))

    # ── 5. Activities ──
    if activities:
        doc.add_heading("5. Classroom Activities", level=1)
        for act in activities:
            title_str = act.get("title", "Activity")
            doc.add_heading(f"{title_str} ({act.get('duration_minutes', 15)} mins)", level=2)
            if act.get("student_instructions"):
                p = doc.add_paragraph()
                run = p.add_run("Student Instructions: ")
                run.bold = True
                p.add_run(str(act["student_instructions"]))
            teacher_inst = act.get("teacher_instructions", [])
            if teacher_inst:
                p = doc.add_paragraph()
                run = p.add_run("Teacher Guidance: ")
                run.bold = True
                p.add_run("; ".join(str(t) for t in teacher_inst))
            materials = act.get("materials_needed", [])
            if materials:
                doc.add_paragraph(f"Materials: {', '.join(str(m) for m in materials)}")

    # ── 6. Assessments ──
    doc.add_heading("6. A/B Test Assessments", level=1)
    for var_key, var_label in [("variant_a", "Variant A — Standard"), ("variant_b", "Variant B — Deep Reasoning")]:
        variant = assessments.get(var_key, {})
        doc.add_heading(var_label, level=2)

        mcqs = variant.get("mcqs", [])
        if mcqs:
            doc.add_heading("MCQs", level=3)
            for i, q in enumerate(mcqs):
                p = doc.add_paragraph()
                run = p.add_run(f"Q{i+1}. {q.get('question', '')}")
                run.bold = True
                for oIdx, opt in enumerate(q.get("options", [])):
                    doc.add_paragraph(f"   ({chr(65+oIdx)}) {opt}")
                ans_p = doc.add_paragraph()
                ans_run = ans_p.add_run(f"Answer: {q.get('correct_option', '')} — {q.get('explanation', '')}")
                ans_run.font.color.rgb = RGBColor(16, 185, 129)

        short_ans = variant.get("short_answer", [])
        if short_ans:
            doc.add_heading("Short Answer", level=3)
            for i, q in enumerate(short_ans):
                p = doc.add_paragraph()
                run = p.add_run(f"Q{i+1}. {q.get('question', '')}")
                run.bold = True
                ans_p = doc.add_paragraph()
                ans_run = ans_p.add_run(f"Model Answer: {q.get('model_answer', '')}")
                ans_run.font.color.rgb = RGBColor(16, 185, 129)

    # ── 7. Gap Analysis ──
    gaps_list = gap_data.get("gaps", [])
    if gaps_list:
        doc.add_heading("7. Learning Gap Analysis & Remediation", level=1)
        table = doc.add_table(rows=1, cols=4)
        table.style = 'Light Grid Accent 1'
        hdr = table.rows[0].cells
        hdr[0].text = "Concept"
        hdr[1].text = "Misconception"
        hdr[2].text = "Diagnostic Question"
        hdr[3].text = "Remedial Action"
        for g in gaps_list:
            row = table.add_row().cells
            row[0].text = str(g.get("concept", ""))
            row[1].text = str(g.get("misconception", ""))
            row[2].text = str(g.get("diagnostic_question", ""))
            row[3].text = str(g.get("remedial_action", ""))

    # ── 8. Validation ──
    if validation:
        doc.add_heading("8. Quality Validation Report", level=1)
        doc.add_paragraph(f"Overall Score: {validation.get('overall_score', 'N/A')}/100")
        doc.add_paragraph(f"Hallucination Flags: {validation.get('hallucination_flags', 0)}")
        issues = validation.get("issues", [])
        for issue in issues:
            text = issue if isinstance(issue, str) else issue.get("description", str(issue))
            doc.add_paragraph(f"  - {text}")

    doc.save(out_path)


# ═══════════════════════════════════════════════════════
# PPTX REPORT (python-pptx)
# ═══════════════════════════════════════════════════════
def generate_pptx(state: dict, out_path: str):
    """Generate a PPTX presentation from TKP state."""
    prs = Presentation()
    prs.slide_width = PptxInches(13.333)
    prs.slide_height = PptxInches(7.5)

    classification = state.get("classification", {})
    knowledge = state.get("knowledge", {})
    lesson_plan = state.get("lesson_plan", {})
    period_contents = state.get("period_contents", [])
    activities = state.get("activities", [])
    assessments = state.get("ab_test_assessment", {})
    gap_data = state.get("gap_analysis", {})

    subject = classification.get("subject", "General Curriculum")
    topic = classification.get("topic", "Teacher Knowledge Package")
    grade = classification.get("target_grade", classification.get("grade_level", "K-12"))
    board = classification.get("curriculum_board", "CBSE/NCERT")
    total_periods = lesson_plan.get("total_periods", len(period_contents) or 3)

    def add_slide(title_text, body_text=""):
        slide_layout = prs.slide_layouts[1]  # Title and Content
        slide = prs.slides.add_slide(slide_layout)
        title = slide.shapes.title
        if title:
            title.text = str(title_text)
        body = slide.placeholders[1] if len(slide.placeholders) > 1 else None
        if body and body_text:
            body.text = str(body_text)[:3000]
        return slide

    def add_title_slide(title_text, subtitle_text):
        slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(slide_layout)
        title = slide.shapes.title
        if title:
            title.text = str(title_text)
        subtitle = slide.placeholders[1] if len(slide.placeholders) > 1 else None
        if subtitle:
            subtitle.text = str(subtitle_text)
        return slide

    # ── Slide 1: Title ──
    add_title_slide(
        f"{subject}: {topic}",
        f"Grade {grade}  |  Board: {board}  |  {total_periods} Teaching Periods\nTeacher Knowledge Package — AI Generated"
    )

    # ── Slide 2: Learning Objectives ──
    objs = knowledge.get("learning_objectives", [])
    if objs:
        obj_text = "\n".join(
            f"• {o if isinstance(o, str) else o.get('objective', str(o))}" for o in objs[:8]
        )
        add_slide("Core Learning Objectives", obj_text)

    # ── Slide 3: Key Concepts ──
    concepts = knowledge.get("concepts", [])
    if concepts:
        concept_text = "\n".join(
            f"• {c if isinstance(c, str) else c.get('name', '')}: {'' if isinstance(c, str) else c.get('description', '')}"
            for c in concepts[:8]
        )
        add_slide("Key Concepts & Definitions", concept_text)

    # ── Slides: Lesson Plan per period ──
    periods = lesson_plan.get("periods", [])
    for p in periods[:10]:
        p_num = p.get("period_number", 1)
        p_title = p.get("title", f"Period {p_num}")
        body = f"Objectives: {', '.join(str(o) for o in p.get('learning_objectives', []))}\n"
        body += f"Methodology: {p.get('teaching_methodology', '')}\n"
        body += f"Concepts: {', '.join(str(c) for c in p.get('concepts_covered', []))}"
        add_slide(f"Period {p_num}: {p_title}", body)

    # ── Slides: Teacher Scripts ──
    for pc in period_contents[:5]:
        p_num = pc.get("period_number", 1)
        script = str(pc.get("teacher_script", ""))[:2500]
        add_slide(f"Period {p_num} — Teacher Script", script)

    # ── Slide: Activities ──
    if activities:
        act_text = "\n\n".join(
            f"• {act.get('title', 'Activity')} ({act.get('duration_minutes', 15)} mins): "
            f"{act.get('student_instructions', '')[:200]}"
            for act in activities[:6]
        )
        add_slide("Classroom Activities", act_text)

    # ── Slide: Assessment Variant A ──
    var_a = assessments.get("variant_a", {})
    mcqs_a = var_a.get("mcqs", [])
    if mcqs_a:
        mcq_text = "\n\n".join(
            f"Q{i+1}. {q.get('question', '')}\nAnswer: {q.get('correct_option', '')}"
            for i, q in enumerate(mcqs_a[:5])
        )
        add_slide("Assessment — Variant A (Standard)", mcq_text)

    # ── Slide: Assessment Variant B ──
    var_b = assessments.get("variant_b", {})
    mcqs_b = var_b.get("mcqs", [])
    if mcqs_b:
        mcq_text = "\n\n".join(
            f"Q{i+1}. {q.get('question', '')}\nAnswer: {q.get('correct_option', '')}"
            for i, q in enumerate(mcqs_b[:5])
        )
        add_slide("Assessment — Variant B (Deep Reasoning)", mcq_text)

    # ── Slide: Gap Analysis ──
    gaps_list = gap_data.get("gaps", [])
    if gaps_list:
        gap_text = "\n\n".join(
            f"• {g.get('concept', '')}: {g.get('misconception', '')}\n  Remediation: {g.get('remedial_action', '')}"
            for g in gaps_list[:5]
        )
        add_slide("Learning Gap Analysis", gap_text)

    # ── Final Slide ──
    add_title_slide("Thank You", "Generated by Teacher AI Platform\nPowered by a 10-Stage AI Pipeline")

    prs.save(out_path)


# ═══════════════════════════════════════════════════════
# PUBLISHING STAGE (orchestrates all three)
# ═══════════════════════════════════════════════════════
class PublishingStage(BaseStage):
    """
    Stage 10: Formatting, PDF/DOCX/PPTX Document Generation and Packaging.
    """
    def execute(self, state: dict) -> dict:
        job_id = self.job_id
        output_dir = Config.OUTPUT_FOLDER
        os.makedirs(output_dir, exist_ok=True)

        pdf_path = os.path.join(output_dir, f"TKP_{job_id}.pdf")
        docx_path = os.path.join(output_dir, f"TKP_{job_id}.docx")
        pptx_path = os.path.join(output_dir, f"TKP_{job_id}.pptx")
        json_path = os.path.join(output_dir, f"TKP_{job_id}.json")

        results = {"format": "JSON+PDF+DOCX+PPTX", "version": "1.0.0", "ready_for_export": True}

        # JSON master file
        try:
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(state, f, indent=2, ensure_ascii=False, default=str)
            results["json_path"] = json_path
            logger.info(f"Generated JSON at: {json_path}")
        except Exception as e:
            logger.error(f"JSON export error: {e}")

        # PDF
        try:
            generate_pdf(state, pdf_path)
            results["pdf_path"] = pdf_path
            logger.info(f"Generated PDF at: {pdf_path}")
        except Exception as e:
            logger.error(f"PDF export error: {e}")

        # DOCX
        try:
            generate_docx(state, docx_path)
            results["docx_path"] = docx_path
            logger.info(f"Generated DOCX at: {docx_path}")
        except Exception as e:
            logger.error(f"DOCX export error: {e}")

        # PPTX
        try:
            generate_pptx(state, pptx_path)
            results["pptx_path"] = pptx_path
            logger.info(f"Generated PPTX at: {pptx_path}")
        except Exception as e:
            logger.error(f"PPTX export error: {e}")

        return results
