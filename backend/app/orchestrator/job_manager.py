import threading
import uuid
import time
import os
import json
import logging
from ..config import Config

logger = logging.getLogger(__name__)

JOBS_INDEX_FILE = os.path.join(Config.CACHE_FOLDER, "_jobs_index.json")

class JobManager:
    def __init__(self):
        self.jobs = {}
        self._load_history()
        
    def _load_history(self):
        """Load all previous jobs from disk on startup."""
        try:
            if os.path.exists(JOBS_INDEX_FILE):
                with open(JOBS_INDEX_FILE, 'r') as f:
                    saved_jobs = json.load(f)
                for job_id, meta in saved_jobs.items():
                    # Mark incomplete jobs as resumable
                    if meta.get("status") == "processing":
                        meta["status"] = "interrupted"
                        meta["stage"] = meta.get("stage", "Unknown") + " (interrupted)"
                    self.jobs[job_id] = meta
                logger.info(f"Loaded {len(self.jobs)} jobs from history")
        except Exception as e:
            logger.warning(f"Could not load job history: {e}")
    
    def _save_jobs_index(self):
        """Persist job metadata index to disk."""
        try:
            # Save only metadata, not the full result (that's in cache files)
            index = {}
            for job_id, job in self.jobs.items():
                index[job_id] = {
                    "id": job["id"],
                    "status": job["status"],
                    "progress": job["progress"],
                    "stage": job.get("stage", ""),
                    "language": job.get("language", "English"),
                    "created_at": job.get("created_at", 0),
                    "file_hash": job.get("file_hash", ""),
                    "error": job.get("error")
                }
            with open(JOBS_INDEX_FILE, 'w') as f:
                json.dump(index, f, indent=2)
        except Exception as e:
            logger.warning(f"Could not save jobs index: {e}")

    def start_job(self, file_path, ref_path=None, language="English", file_hash=None):
        """Start a new job, or resume an existing one if same file_hash exists."""
        
        # Check if we already have a completed job for this file
        if file_hash:
            for existing_id, existing_job in self.jobs.items():
                if existing_job.get("file_hash") == file_hash and existing_job.get("status") == "completed":
                    logger.info(f"Found completed cache for hash {file_hash[:8]}. Returning existing job.")
                    return existing_id
        
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "id": job_id,
            "status": "pending",
            "progress": 0,
            "stage": "Initializing",
            "language": language,
            "file_hash": file_hash,
            "created_at": time.time(),
            "result": None,
            "error": None
        }
        self._save_jobs_index()
        
        thread = threading.Thread(target=self._run_pipeline, args=(job_id, file_path, ref_path, language, file_hash))
        thread.daemon = True
        thread.start()
        
        return job_id
        
    def _run_pipeline(self, job_id, file_path, ref_path=None, language="English", file_hash=None):
        try:
            self.jobs[job_id]["status"] = "processing"
            
            # --- CACHING SETUP ---
            cache_file = None
            if file_hash:
                cache_file = os.path.join(Config.CACHE_FOLDER, f"{file_hash}.json")
                
            state = {}
            if cache_file and os.path.exists(cache_file):
                try:
                    with open(cache_file, 'r') as f:
                        state = json.load(f)
                    cached_keys = list(state.keys())
                    logger.info(f"Resuming from cache. Completed stages: {cached_keys}")
                except Exception:
                    state = {}
                    
            def save_state():
                """Persist state to disk after each stage for resumability."""
                if cache_file:
                    with open(cache_file, 'w') as f:
                        json.dump(state, f)
                self._save_jobs_index()
            
            # ============================
            # STAGE 1: Document Parsing (FREE - local PyPDF2)
            # ============================
            if 'doc_intel' not in state:
                self.jobs[job_id]["stage"] = "Stage 1: Parsing Document"
                self.jobs[job_id]["progress"] = 5
                self._save_jobs_index()
                from ..stages.s1_document_intelligence import DocumentIntelligenceStage
                s1 = DocumentIntelligenceStage(job_id)
                doc_intel = s1.execute(file_path, ref_path)
                state['doc_intel'] = doc_intel.model_dump()
                save_state()
                logger.info("Stage 1 complete: Document parsed (local, free)")
            else:
                logger.info("Stage 1 skipped (cached)")
            
            # ============================
            # STAGE 2: Classification (1 API call)
            # ============================
            if 'classification' not in state:
                self.jobs[job_id]["stage"] = "Stage 2: Classifying Content"
                self.jobs[job_id]["progress"] = 15
                self._save_jobs_index()
                from ..stages.s2_educational_classification import EducationalClassificationStage
                s2 = EducationalClassificationStage(job_id, config={"language": language})
                classification = s2.execute(state['doc_intel'])
                state['classification'] = classification.model_dump()
                save_state()
                logger.info("Stage 2 complete: Classification done")
            else:
                logger.info("Stage 2 skipped (cached)")

            # ============================
            # STAGE 3: Knowledge Extraction (1 API call)
            # ============================
            if 'knowledge' not in state:
                self.jobs[job_id]["stage"] = "Stage 3: Extracting Knowledge"
                self.jobs[job_id]["progress"] = 25
                self._save_jobs_index()
                from ..stages.s3_knowledge_extraction import KnowledgeExtractionStage
                s3 = KnowledgeExtractionStage(job_id, config={"language": language})
                knowledge = s3.execute(state['doc_intel'], state['classification'])
                state['knowledge'] = knowledge.model_dump()
                save_state()
                logger.info("Stage 3 complete: Knowledge extracted")
            else:
                logger.info("Stage 3 skipped (cached)")
            
            # ============================
            # STAGE 4: Lesson Planning (1 API call)
            # ============================
            if 'lesson_plan' not in state:
                self.jobs[job_id]["stage"] = "Stage 4: Planning Lessons"
                self.jobs[job_id]["progress"] = 40
                self._save_jobs_index()
                from ..stages.s4_lesson_planner import LessonPlannerStage
                s4 = LessonPlannerStage(job_id, config={"language": language})
                lesson_plan = s4.execute(state['classification'], state['knowledge'])
                state['lesson_plan'] = lesson_plan.model_dump()
                save_state()
                logger.info("Stage 4 complete: Lesson plan created")
            else:
                logger.info("Stage 4 skipped (cached)")
            
            from ..models.stage4_planner import TeachingPlan
            lesson_plan_obj = TeachingPlan.model_validate(state['lesson_plan'])
            
            # ============================
            # STAGE 5: Content Generation (1 API call per period)
            # ============================
            if 'period_contents' not in state:
                self.jobs[job_id]["stage"] = "Stage 5: Generating Content"
                self.jobs[job_id]["progress"] = 55
                self._save_jobs_index()
                from ..stages.s5_content_generation import ContentGenerationStage
                s5 = ContentGenerationStage(job_id, config={"language": language})
                period_contents = s5.execute(lesson_plan_obj)
                state['period_contents'] = [pc.model_dump() for pc in period_contents]
                save_state()
                logger.info("Stage 5 complete: Content generated")
            else:
                logger.info("Stage 5 skipped (cached)")
            
            # ============================
            # STAGE 6: Activity Design (1 API call per period)
            # ============================
            if 'activities' not in state:
                self.jobs[job_id]["stage"] = "Stage 6: Designing Activities"
                self.jobs[job_id]["progress"] = 68
                self._save_jobs_index()
                from ..stages.s6_activities import ActivityGenerationStage
                s6 = ActivityGenerationStage(job_id, config={"language": language})
                activities = s6.execute(lesson_plan_obj)
                state['activities'] = [act.model_dump() for act in activities]
                save_state()
                logger.info("Stage 6 complete: Activities designed")
            else:
                logger.info("Stage 6 skipped (cached)")
            
            # ============================
            # STAGE 7: Assessment Generation (1 API call)
            # ============================
            if 'ab_test_assessment' not in state:
                self.jobs[job_id]["stage"] = "Stage 7: Creating Assessments"
                self.jobs[job_id]["progress"] = 78
                self._save_jobs_index()
                from ..stages.s7_assessment import AssessmentGenerationStage
                s7 = AssessmentGenerationStage(job_id, config={"language": language})
                ab_test = s7.execute(state['knowledge'])
                state['ab_test_assessment'] = ab_test.model_dump()
                save_state()
                logger.info("Stage 7 complete: Assessments created")
            else:
                logger.info("Stage 7 skipped (cached)")
            
            # ============================
            # STAGE 8: Gap Analysis (1 API call)
            # ============================
            if 'gap_analysis' not in state:
                self.jobs[job_id]["stage"] = "Stage 8: Analyzing Gaps"
                self.jobs[job_id]["progress"] = 86
                self._save_jobs_index()
                from ..stages.s8_gap_analysis import GapAnalysisStage
                s8 = GapAnalysisStage(job_id, config={"language": language})
                gaps = s8.execute(state['knowledge'])
                state['gap_analysis'] = gaps.model_dump()
                save_state()
                logger.info("Stage 8 complete: Gap analysis done")
            else:
                logger.info("Stage 8 skipped (cached)")

            # ============================
            # STAGE 9: Validation (1 API call)
            # ============================
            if 'validation' not in state:
                self.jobs[job_id]["stage"] = "Stage 9: Validating Quality"
                self.jobs[job_id]["progress"] = 93
                self._save_jobs_index()
                from ..stages.s9_validation import ValidationStage
                s9 = ValidationStage(job_id, config={"language": language})
                validation = s9.execute(state['doc_intel'], str(state.get('lesson_plan', '')))
                state['validation'] = validation.model_dump()
                save_state()
                logger.info("Stage 9 complete: Validation done")
            else:
                logger.info("Stage 9 skipped (cached)")
            
            # ============================
            # STAGE 10: Publishing (No API call)
            # ============================
            if 'publishing' not in state:
                self.jobs[job_id]["stage"] = "Stage 10: Packaging TKP"
                self.jobs[job_id]["progress"] = 98
                self._save_jobs_index()
                from ..stages.s10_publishing import PublishingStage
                s10 = PublishingStage(job_id, config={"language": language})
                publishing = s10.execute()
                state['publishing'] = publishing
                save_state()
                logger.info("Stage 10 complete: TKP packaged")
            else:
                logger.info("Stage 10 skipped (cached)")
            
            # ============================
            # DONE
            # ============================
            self.jobs[job_id]["status"] = "completed"
            self.jobs[job_id]["progress"] = 100
            self.jobs[job_id]["stage"] = "Done"
            self.jobs[job_id]["result"] = state
            self._save_jobs_index()
            logger.info(f"Pipeline complete for job {job_id}")
            
        except Exception as e:
            logger.error(f"Pipeline error at '{self.jobs[job_id].get('stage')}': {e}")
            self.jobs[job_id]["status"] = "error"
            self.jobs[job_id]["error"] = f"{self.jobs[job_id].get('stage', 'Unknown')}: {str(e)}"
            self._save_jobs_index()
            
    def get_job_status(self, job_id: str) -> dict:
        job = self.jobs.get(job_id)
        if not job:
            return {"status": "not_found"}
        
        # If completed, load full result from cache if not in memory
        if job.get("status") == "completed" and not job.get("result"):
            file_hash = job.get("file_hash")
            if file_hash:
                cache_file = os.path.join(Config.CACHE_FOLDER, f"{file_hash}.json")
                if os.path.exists(cache_file):
                    try:
                        with open(cache_file, 'r') as f:
                            job["result"] = json.load(f)
                    except Exception:
                        pass
        return job

    def get_all_jobs(self) -> list:
        return [
            {
                "id": j["id"],
                "status": j["status"],
                "progress": j["progress"],
                "stage": j.get("stage", ""),
                "language": j.get("language", "English"),
                "created_at": j.get("created_at", 0)
            }
            for j in sorted(self.jobs.values(), key=lambda x: x.get("created_at", 0), reverse=True)
        ]

# Global instance for the app
job_manager = JobManager()
