from pathlib import Path
import re


root = Path(__file__).resolve().parent
page = (root / "index.html").read_text(encoding="utf-8")
styles = (root / "styles.css").read_text(encoding="utf-8")
code = (root / "app.js").read_text(encoding="utf-8")
if "</script" in code.lower() or "</style" in styles.lower():
    raise ValueError("An embedded asset contains a closing HTML tag.")
page, style_count = re.subn(
    r'    (?:<link rel="stylesheet" href="styles\.css[^\"]*" />|<style id="app-styles">.*?</style>)',
    lambda match: f'    <style id="app-styles">\n{styles}\n    </style>',
    page,
    count=1,
    flags=re.DOTALL,
)
page, script_count = re.subn(
    r'    (?:<script src="app\.js[^\"]*"></script>|<script id="app-code">.*?</script>)',
    lambda match: f'    <script id="app-code">\n{code}\n    </script>',
    page,
    count=1,
    flags=re.DOTALL,
)
if style_count != 1 or script_count != 1:
    raise ValueError("Could not locate the page's style and script placeholders.")
(root / "index.html").write_text(page, encoding="utf-8")
print("Built self-contained index.html from app.js and styles.css.")
