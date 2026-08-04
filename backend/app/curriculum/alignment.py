import json
import os
from typing import Dict, Any, List
from difflib import SequenceMatcher

class CurriculumAligner:
    """
    Matches document classification to a specific board's curriculum standards
    and injects those standards into the downstream prompts.
    """
    def __init__(self, standards_dir: str = None):
        if not standards_dir:
            self.standards_dir = os.path.join(os.path.dirname(__file__), 'standards')
        else:
            self.standards_dir = standards_dir
            
    def load_standards(self, board: str, subject: str, grade: str) -> Dict[str, Any]:
        """Loads the JSON config for a specific board/subject/grade combination."""
        # Normalize for filename: e.g. "cbse_science.json"
        board_clean = board.lower().replace(" ", "")
        subject_clean = subject.lower().replace(" ", "")
        
        filename = f"{board_clean}_{subject_clean}.json"
        filepath = os.path.join(self.standards_dir, filename)
        
        if not os.path.exists(filepath):
            return None
            
        with open(filepath, 'r') as f:
            data = json.load(f)
            # Verify grade matches (simplistic check)
            if data.get('grade') == grade:
                return data
        return None
        
    def find_best_chapter_match(self, toc: List[str], standards: Dict[str, Any]) -> Dict[str, Any]:
        """Uses fuzzy string matching to find which chapter in the curriculum matches the document TOC."""
        if not standards or not toc:
            return None
            
        best_match = None
        highest_score = 0
        
        toc_text = " ".join(toc).lower()
        
        for chapter in standards.get('chapters', []):
            chapter_name = chapter.get('name', '').lower()
            keywords = [k.lower() for k in chapter.get('keywords', [])]
            
            # Simple scoring: +0.5 for name match, +0.1 for each keyword match
            score = 0
            if SequenceMatcher(None, chapter_name, toc_text).ratio() > 0.4:
                score += 0.5
                
            for kw in keywords:
                if kw in toc_text:
                    score += 0.1
                    
            if score > highest_score and score > 0.3: # Threshold
                highest_score = score
                best_match = chapter
                
        if best_match:
            best_match['alignment_score'] = min(highest_score, 1.0)
            
        return best_match
