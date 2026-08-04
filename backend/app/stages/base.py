from abc import ABC, abstractmethod
from typing import Any, Dict

class BaseStage(ABC):
    def __init__(self, document_id: str, config: Dict[str, Any] = None):
        self.document_id = document_id
        self.config = config or {}

    @abstractmethod
    def execute(self, *args, **kwargs) -> Any:
        """
        Executes the logic for this stage.
        Must be implemented by subclasses.
        """
        pass
