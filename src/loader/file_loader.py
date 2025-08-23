# src/loader/file_loader.py

from pathlib import Path

class FileLoader:
    """Loads text content from a file."""

    def __init__(self, filepath: str):
        self.filepath = Path(filepath)

    def load(self) -> str:
        """Read the file and return its text content."""
        if not self.filepath.exists():
            raise FileNotFoundError(f"File not found: {self.filepath}")
        return self.filepath.read_text(encoding="utf-8")
