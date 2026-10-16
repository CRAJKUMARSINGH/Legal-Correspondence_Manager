"""
output_utils.py
───────────────
Shared output helpers for all Legal-Correspondence-Manager scripts.

WHAT THIS DOES
──────────────
After generating any document, call `publish_output()` to:
  1. Copy the HTML to  public/docs/<filename>   (Netlify static CDN)
  2. Copy DOCX / PDF  to  public/docs/<filename> (optional, for direct download)
  3. Print a clear success block showing:
       ✓ DOCX  saved : <path>
       ✓ PDF   saved : <path>
       ✓ HTML  saved : public/docs/<filename>
       🌐 Available at : https://<site>.netlify.app/docs/<filename>

NETLIFY_SITE env var
────────────────────
Set NETLIFY_SITE in your environment (or .env) to your site's subdomain.
  $env:NETLIFY_SITE = "legal-correspondence-manager"   (PowerShell)
  export NETLIFY_SITE=legal-correspondence-manager      (bash)

If not set, falls back to a placeholder URL that you can copy-edit.
"""

import os
import shutil

# ── Resolve project root robustly ─────────────────────────────────────────────
_HERE        = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.normpath(os.path.join(_HERE, ".."))
PUBLIC_DOCS  = os.path.join(PROJECT_ROOT, "public", "docs")

# ── Netlify site name (override via env var) ──────────────────────────────────
NETLIFY_SITE = os.environ.get("NETLIFY_SITE", "legal-correspondence-manager")
NETLIFY_BASE = f"https://{NETLIFY_SITE}.netlify.app"


def _ensure_public_docs():
    """Create public/docs/ if it doesn't exist."""
    os.makedirs(PUBLIC_DOCS, exist_ok=True)


def publish_output(
    html_path:  str | None = None,
    docx_path:  str | None = None,
    pdf_path:   str | None = None,
):
    """
    Copy generated files to public/docs/ and print the Netlify URL.

    Parameters
    ----------
    html_path  : path to the generated HTML file (will be publicly served)
    docx_path  : path to the generated DOCX file (optional)
    pdf_path   : path to the generated PDF file  (optional)
    """
    _ensure_public_docs()

    lines   = []
    netlify_urls = []

    for label, src in [("HTML", html_path), ("DOCX", docx_path), ("PDF", pdf_path)]:
        if not src:
            continue
        if not os.path.isfile(src):
            lines.append(f"  [!!] {label} not found : {src}")
            continue

        filename = os.path.basename(src)
        dest     = os.path.join(PUBLIC_DOCS, filename)
        shutil.copy2(src, dest)
        size = os.path.getsize(dest)
        lines.append(f"  [OK] {label:<5} saved  : {dest}  ({size:,} bytes)")

        # Only HTML gets a public URL (DOCX/PDF are large binaries;
        # include them too if you want direct download links)
        netlify_url = f"{NETLIFY_BASE}/docs/{filename}"
        netlify_urls.append((label, netlify_url))

    # ── Print summary ─────────────────────────────────────────────────────────
    print()
    print("=" * 68)
    print("  OUTPUT GENERATED")
    print("=" * 68)
    for line in lines:
        print(line)

    if netlify_urls:
        print()
        print("  [WEB] Available at (after Netlify deploy):")
        for label, url in netlify_urls:
            print(f"        {label:<5}  ->  {url}")
    print("=" * 68)
    print()
