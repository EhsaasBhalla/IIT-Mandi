import os
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from .base import BaseStage
from ..parsers.pdf_parser import PDFParser

class DocumentChunk(BaseModel):
    content: str
    type: str
    page_number: Optional[int] = None

class DocumentIntelResult(BaseModel):
    document_id: str
    total_chunks: int
    chunks: List[DocumentChunk]
    table_of_contents: List[str]

class DocumentIntelligenceStage(BaseStage):
    """
    Stage 1: Parses uploaded documents while preserving structural hierarchy.
    """
    def execute(self, file_path: str, ref_path: str = None) -> DocumentIntelResult:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        chunks = []
        
        if ext == '.pdf':
            parser = PDFParser(file_path)
            parsed_chunks = parser.parse()
            # Convert to Pydantic models
            for pc in parsed_chunks:
                chunks.append(DocumentChunk(
                    content=pc.text,
                    type=pc.chunk_type,
                    page_number=pc.metadata.get("page")
                ))
        else:
            # For prototype, we'll only fully support PDF. 
            # Throw NotImplementedError for others for now or use simple text read.
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                text = f.read()
                chunks.append(DocumentChunk(
                    content=text,
                    type="text"
                ))
                
        # Parse reference file if provided
        if ref_path and os.path.exists(ref_path):
            ext_ref = os.path.splitext(ref_path)[1].lower()
            if ext_ref == '.pdf':
                parser = PDFParser(ref_path)
                parsed_chunks = parser.parse()
                for pc in parsed_chunks:
                    chunks.append(DocumentChunk(
                        content=f"[REFERENCE MATERIAL] {pc.text}",
                        type=pc.chunk_type,
                        page_number=pc.metadata.get("page")
                    ))
            else:
                with open(ref_path, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
                    chunks.append(DocumentChunk(
                        content=f"[REFERENCE MATERIAL]\n{text}",
                        type="text"
                    ))
                
        # Basic table of contents heuristic: gather all headings
        toc = [c.content for c in chunks if c.type == "heading"]
        
        return DocumentIntelResult(
            document_id=self.document_id,
            total_chunks=len(chunks),
            chunks=chunks,
            table_of_contents=toc
        )
