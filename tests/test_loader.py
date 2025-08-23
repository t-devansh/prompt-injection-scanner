# tests/test_loader.py

import tempfile
from src.loader.file_loader import FileLoader

def test_file_loader_reads_content():
    # Create a temporary file with some text
    with tempfile.NamedTemporaryFile("w+", delete=False) as tmp:
        tmp.write("hello world")
        tmp_path = tmp.name

    # Use the FileLoader
    loader = FileLoader(tmp_path)
    content = loader.load()

    assert content == "hello world"
