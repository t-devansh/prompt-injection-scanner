# tests/test_surface_finder.py
from src.finder.surfaces import find_surfaces

def test_finds_user_input_and_rendered():
    html = """
    <div>
      <input id="q" type="text" value="hello">
      <article class="user-content">This is user text here</article>
      <div class="ai-output">Assistant reply: …</div>
    </div>
    """
    surfaces = find_surfaces(html)
    roles = [s.role for s in surfaces]
    assert "user_input" in roles
    assert "rendered_user_content" in roles
    assert "ai_output" in roles

    # basic shape
    for s in surfaces:
        assert isinstance(s.selector, str)
        assert isinstance(s.sample_text, str)
        assert isinstance(s.visible, bool)
