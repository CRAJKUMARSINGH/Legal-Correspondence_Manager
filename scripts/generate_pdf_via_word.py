"""
Convert DOCX to PDF using Microsoft Word COM automation.
This ensures correct Hindi/Devanagari font rendering.
"""

import os, sys
import win32com.client

import shutil, tempfile

DOCX_SRC  = r"E:\Rajkumar\Legal-Correspondence_Manager\docs\neel_kanth_deposit_refund_application.docx"
PDF_PATH  = r"E:\Rajkumar\Legal-Correspondence_Manager\docs\neel_kanth_deposit_refund_application.pdf"

# Copy to temp to avoid read-only issues
_tmp_dir  = tempfile.mkdtemp()
DOCX_PATH = os.path.join(_tmp_dir, "neel_kanth_temp.docx")
shutil.copy2(DOCX_SRC, DOCX_PATH)
os.chmod(DOCX_PATH, 0o666)

# wdFormatPDF = 17
WD_FORMAT_PDF = 17

print(f"Opening Word...")
word = win32com.client.Dispatch("Word.Application")
word.Visible = False

try:
    print(f"Loading: {DOCX_PATH}")
    doc = word.Documents.Open(DOCX_PATH)

    # Export to a temp PDF first, then copy to final destination
    TMP_PDF = os.path.join(_tmp_dir, "output.pdf")
    print(f"Exporting PDF to temp: {TMP_PDF}")
    doc.ExportAsFixedFormat(
        OutputFileName=TMP_PDF,
        ExportFormat=WD_FORMAT_PDF,
        OpenAfterExport=False,
        OptimizeFor=0,
        Range=0,
        IncludeDocProps=True,
        KeepIRM=True,
        CreateBookmarks=0,
        DocStructureTags=True,
        BitmapMissingFonts=True,
        UseISO19005_1=False
    )
    doc.Close(False)
    # Move to final destination
    shutil.copy2(TMP_PDF, PDF_PATH)
    print(f"SUCCESS — PDF saved: {PDF_PATH}")
    size = os.path.getsize(PDF_PATH)
    print(f"File size: {size:,} bytes")
except Exception as e:
    print(f"ERROR: {e}", file=sys.stderr)
    sys.exit(1)
finally:
    word.Quit()
