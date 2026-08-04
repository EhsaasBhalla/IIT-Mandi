import os
import re
import logging
from typing import List, Dict, Any
from pydantic import BaseModel

logger = logging.getLogger(__name__)

class ParsedChunk(BaseModel):
    chunk_type: str  # "heading", "text", "table", "image", "math"
    text: str
    metadata: Dict[str, Any]

class PDFParser:
    """
    Cost-Optimized PDF Parser.
    Extracts text locally using PyPDF2 (zero API cost).
    Only the extracted text is later sent to LLM stages for understanding.
    """
    def __init__(self, file_path: str):
        self.file_path = file_path
        
    def parse(self) -> List[ParsedChunk]:
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"PDF not found: {self.file_path}")
        
        ext = os.path.splitext(self.file_path)[1].lower()
        
        if ext == '.pdf':
            return self._extract_pdf()
        elif ext in ('.txt', '.md'):
            return self._extract_text_file()
        else:
            return self._extract_text_file()
    
    def _extract_pdf(self) -> List[ParsedChunk]:
        """Extract text from PDF locally using PyPDF2 — zero API cost."""
        try:
            import PyPDF2
        except ImportError:
            logger.error("PyPDF2 not installed. Run: pip install PyPDF2")
            return [ParsedChunk(chunk_type="text", text="[Error: PyPDF2 not installed]", metadata={"page": 0})]
        
        chunks = []
        try:
            with open(self.file_path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                total_pages = len(reader.pages)
                logger.info(f"Parsing PDF: {os.path.basename(self.file_path)} ({total_pages} pages)")
                
                for i, page in enumerate(reader.pages):
                    text = page.extract_text() or ""
                    if not text.strip():
                        continue
                    
                    # Smart chunking: detect headings, tables, math
                    page_chunks = self._smart_chunk(text, page_num=i + 1)
                    chunks.extend(page_chunks)
            
            if not chunks:
                # Fallback: entire file as one chunk
                chunks.append(ParsedChunk(
                    chunk_type="text",
                    text="[No text could be extracted from this PDF. It may be a scanned document.]",
                    metadata={"page": 0, "warning": "empty_extraction"}
                ))
            
            logger.info(f"Extracted {len(chunks)} chunks from {total_pages} pages")
            return chunks
            
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            return [ParsedChunk(
                chunk_type="text",
                text=f"[PDF extraction failed: {str(e)}]",
                metadata={"page": 0, "error": str(e)}
            )]
    
    def _extract_text_file(self) -> List[ParsedChunk]:
        """Simple text/markdown file reader."""
        with open(self.file_path, 'r', encoding='utf-8', errors='ignore') as f:
            text = f.read()
        return self._smart_chunk(text, page_num=1)
    
    def _smart_chunk(self, text: str, page_num: int) -> List[ParsedChunk]:
        """
        Intelligently splits text into semantic chunks.
        Detects headings, math equations, tables, and regular text.
        """
        chunks = []
        lines = text.split('\n')
        current_lines = []
        current_type = "text"
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                if current_lines:
                    current_lines.append(line)
                continue
            
            # Detect headings (ALL CAPS lines, or lines starting with chapter/section markers)
            is_heading = (
                stripped.isupper() and len(stripped) > 3 and len(stripped) < 100
                or re.match(r'^(Chapter|CHAPTER|Section|SECTION|Unit|UNIT)\s*[\d.:]+', stripped)
                or re.match(r'^\d+\.\d+\s+[A-Z]', stripped)
            )
            
            # Detect math (lines with common math symbols)
            has_math = bool(re.search(r'[=∫∑∏√±×÷∞≤≥≠∈∉⊂⊃∪∩]', stripped)) or '$$' in stripped
            
            # Detect table-like content (lines with multiple | or tab separators)
            is_table = stripped.count('|') >= 2 or stripped.count('\t') >= 2
            
            if is_heading:
                # Flush current chunk
                if current_lines:
                    chunks.append(ParsedChunk(
                        chunk_type=current_type,
                        text='\n'.join(current_lines).strip(),
                        metadata={"page": page_num}
                    ))
                    current_lines = []
                chunks.append(ParsedChunk(
                    chunk_type="heading",
                    text=stripped,
                    metadata={"page": page_num}
                ))
                current_type = "text"
            elif has_math and current_type != "math":
                if current_lines:
                    chunks.append(ParsedChunk(
                        chunk_type=current_type,
                        text='\n'.join(current_lines).strip(),
                        metadata={"page": page_num}
                    ))
                    current_lines = []
                current_lines.append(line)
                current_type = "math"
            elif is_table and current_type != "table":
                if current_lines:
                    chunks.append(ParsedChunk(
                        chunk_type=current_type,
                        text='\n'.join(current_lines).strip(),
                        metadata={"page": page_num}
                    ))
                    current_lines = []
                current_lines.append(line)
                current_type = "table"
            else:
                current_lines.append(line)
        
        # Flush remaining
        if current_lines:
            final_text = '\n'.join(current_lines).strip()
            if final_text:
                chunks.append(ParsedChunk(
                    chunk_type=current_type,
                    text=final_text,
                    metadata={"page": page_num}
                ))
        
        return chunks
