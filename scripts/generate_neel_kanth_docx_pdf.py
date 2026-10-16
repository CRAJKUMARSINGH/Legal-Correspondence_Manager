"""
Generate DOCX + PDF – Neel Kanth Sharma Deposit Refund Application
PWD Gramin Khand Dwitiya, Udaipur
- Font  : Nirmala UI (embeds correctly for Hindi/Devanagari)
- Colour: Black & White only
- Table : 4 columns (no Shesh Rashi column)
- Data  : 24 unique entries, Total Rs.2,95,889
"""

import os, shutil, tempfile
import sys; sys.path.insert(0, os.path.dirname(__file__))
from output_utils import publish_output
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

OUT_DIR   = r"E:\Rajkumar\Legal-Correspondence_Manager\docs"
DOCX_PATH = os.path.join(OUT_DIR, "neel_kanth_deposit_refund_application.docx")
PDF_PATH  = os.path.join(OUT_DIR, "neel_kanth_deposit_refund_application.pdf")

HINDI_FONT = "Nirmala UI"
BLACK      = "000000"
WHITE      = "FFFFFF"

# ── Deposit data (24 unique entries) ─────────────────────────────────────────
deposits = [
    ( 1, "CR No. 8954422", "23-03-2022", "4,990"),
    ( 2, "V No. 23351",    "22-08-2019", "15,947"),
    ( 3, "CR No. 3090",    "17-04-2017", "5,000"),
    ( 4, "CR No. 2474787", "20-08-2020", "5,000"),
    ( 5, "CR No. 5876109", "06-01-2020", "4,500"),
    ( 6, "CR No. 1513609", "11-06-2018", "2,450"),
    ( 7, "CR No. 5098329", "04-12-2019", "4,000"),
    ( 8, "V No. 29499",    "24-09-2020", "62,426"),
    ( 9, "CR No. 4649760", "06-02-2018", "2,000"),
    (10, "V No. 14900",    "28-06-2019", "35,865"),
    (11, "CR No. 5098326", "04-12-2019", "3,000"),
    (12, "CR No. 7567817", "07-03-2020", "4,500"),
    (13, "CR No. 7567750", "07-03-2020", "4,700"),
    (14, "V No. 22313",    "21-08-2020", "37,595"),
    (15, "CR No. 5876105", "06-01-2020", "4,000"),
    (16, "V No. 62407",    "12-03-2020", "1,271"),
    (17, "CR No. 2474667", "20-08-2020", "7,750"),
    (18, "V No. 70082",    "30-03-2021", "3,580"),
    (19, "V No. 70235",    "21-06-2021", "61,315"),
    (20, "CR No. 2474822", "20-08-2020", "10,000"),
    (21, "CR No. 3549058", "18-10-2018", "7,500"),
    (22, "CR No. 4881121", "20-02-2018", "2,000"),
    (23, "CR No. 1960424", "05-07-2018", "2,500"),
    (24, "CR No. 5876108", "06-01-2020", "4,000"),
]

# ── Helpers ───────────────────────────────────────────────────────────────────
def apply_font(run, size_pt, bold=False, color_rgb=None):
    run.bold = bold
    run.font.size = Pt(size_pt)
    run.font.name = HINDI_FONT
    rPr    = run._element.get_or_add_rPr()
    rFonts = rPr.get_or_add_rFonts()
    for slot in ("w:ascii", "w:hAnsi", "w:eastAsia", "w:cs"):
        rFonts.set(qn(slot), HINDI_FONT)
    if color_rgb:
        run.font.color.rgb = RGBColor(*color_rgb)
    else:
        run.font.color.rgb = RGBColor(0, 0, 0)

def add_para(doc, text, bold=False, size=12,
             align=WD_ALIGN_PARAGRAPH.LEFT, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_after  = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    run = p.add_run(text)
    apply_font(run, size, bold)
    return p

def add_mixed(doc, parts, size=12,
              align=WD_ALIGN_PARAGRAPH.LEFT, space_after=6):
    p = doc.add_paragraph()
    p.alignment = align
    p.paragraph_format.space_after  = Pt(space_after)
    p.paragraph_format.space_before = Pt(0)
    for text, bold in parts:
        run = p.add_run(text)
        apply_font(run, size, bold)
    return p

def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd  = OxmlElement("w:shd")
    shd.set(qn("w:val"),   "clear")
    shd.set(qn("w:color"), "auto")
    shd.set(qn("w:fill"),  hex_color)
    tcPr.append(shd)

def set_cell_borders(cell, color="000000"):
    tcPr      = cell._tc.get_or_add_tcPr()
    tcBorders = OxmlElement("w:tcBorders")
    for edge in ("top", "left", "bottom", "right"):
        tag = OxmlElement(f"w:{edge}")
        tag.set(qn("w:val"),   "single")
        tag.set(qn("w:sz"),    "4")
        tag.set(qn("w:space"), "0")
        tag.set(qn("w:color"), color)
        tcBorders.append(tag)
    tcPr.append(tcBorders)

def cell_para(cell, text, bold=False, size=11,
              align=WD_ALIGN_PARAGRAPH.CENTER, color_rgb=None):
    p = cell.paragraphs[0]
    p.alignment = align
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after  = Pt(2)
    run = p.add_run(text)
    apply_font(run, size, bold, color_rgb)

# ── Build Document ────────────────────────────────────────────────────────────
doc = Document()

section = doc.sections[0]
section.page_width    = Cm(21.0)
section.page_height   = Cm(29.7)
section.left_margin   = Cm(3.0)
section.right_margin  = Cm(2.5)
section.top_margin    = Cm(2.5)
section.bottom_margin = Cm(2.5)

style = doc.styles["Normal"]
style.font.name = HINDI_FONT
style.font.size = Pt(12)
style._element.rPr.rFonts.set(qn("w:cs"), HINDI_FONT)

# Date
add_para(doc, "दिनांक : 01 अक्टूबर 2026",
         align=WD_ALIGN_PARAGRAPH.RIGHT, size=12, space_after=12)

# Addressee
add_para(doc, "सेवा में,", bold=True, size=12, space_after=2)
add_para(doc, "    अधिशासी अभियन्ता,",      size=12, space_after=1)
add_para(doc, "    लोक निर्माण विभाग,",     size=12, space_after=1)
add_para(doc, "    ग्रामीण खण्ड द्वितीय,", size=12, space_after=1)
add_para(doc, "    उदयपुर (राजस्थान)",       bold=True, size=12, space_after=16)

# Subject
add_mixed(doc, [
    ("विषय : ", True),
    ("लोक निर्माण विभाग, ग्रामीण खण्ड द्वितीय, उदयपुर में विभिन्न कार्यों हेतु जमा की गई "
     "धरोहर / अग्रिम जमा राशि की वापसी के सम्बन्ध में।", False),
], size=12, space_after=12)

# Salutation
add_para(doc, "महोदय,", bold=True, size=12, space_after=8)

# Para 1
add_mixed(doc, [
    ("        सविनय निवेदन है कि मैं ", False),
    ("नील कंठ शर्मा", True),
    (", ठेकेदार, उदयपुर, आपके विभाग — लोक निर्माण विभाग, ग्रामीण खण्ड द्वितीय, उदयपुर में "
     "पंजीकृत एवं सक्रिय ठेकेदार हूँ। मैंने समय-समय पर विभिन्न कार्यों के अन्तर्गत निर्धारित "
     "प्रक्रिया के अनुसार धरोहर राशि (Security Deposit) एवं अन्य अग्रिम जमा राशियाँ विभाग के "
     "कोषागार / कार्यालय में जमा कराई हैं, जिनका विवरण नीचे तालिका में अंकित है।", False),
], size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=8)

# Para 2
add_para(doc,
    "        उपरोक्त सभी कार्य पूर्ण हो चुके हैं अथवा सम्बन्धित अनुबन्ध की शर्तें पूरी की जा "
    "चुकी हैं। इन जमा राशियों का कोई उपयोग शेष नहीं है, अतः उक्त जमा राशि मेरे द्वारा वापस "
    "प्राप्त की जानी न्यायोचित एवं नियमानुसार है।",
    size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=12)

# ── Table (4 columns, B&W) ────────────────────────────────────────────────────
table = doc.add_table(rows=1, cols=4)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.style = "Table Grid"

for i, w in enumerate([Cm(1.4), Cm(5.5), Cm(3.5), Cm(3.5)]):
    for cell in table.columns[i].cells:
        cell.width = w

# Header — black background, white text
hdr = table.rows[0].cells
for i, txt in enumerate(["क्र.सं.", "रसीद / वाउचर संख्या",
                          "जमा दिनांक", "जमा राशि (₹)"]):
    set_cell_bg(hdr[i], BLACK)
    set_cell_borders(hdr[i], BLACK)
    cell_para(hdr[i], txt, bold=True, size=11, color_rgb=(255, 255, 255))

# Data rows — white background, black text, black borders
for num, ref, dt, amt in deposits:
    row = table.add_row()
    for i, (cell, txt) in enumerate(zip(row.cells, [str(num), ref, dt, amt])):
        set_cell_bg(cell, WHITE)
        set_cell_borders(cell, BLACK)
        cell_para(cell, txt, size=10.5, color_rgb=(0, 0, 0))

# Total row — white bg, bold, thick top border
tot = table.add_row()
for cell in tot.cells:
    set_cell_bg(cell, WHITE)
    set_cell_borders(cell, BLACK)
tot.cells[0].merge(tot.cells[1]).merge(tot.cells[2])
cell_para(tot.cells[0], "कुल योग", bold=True, size=11)
cell_para(tot.cells[3], "2,95,889", bold=True, size=11)

doc.add_paragraph()

# Para 3 – prayer
add_mixed(doc, [
    ("        अतः महोदय से सविनय अनुरोध है कि उपरोक्त विवरण के अनुसार कुल ", False),
    ("₹ 2,95,889/- (रुपये दो लाख पचानवे हजार आठ सौ नवासी मात्र)", True),
    (" की जमा राशि मेरे पक्ष में यथाशीघ्र वापस कराने की कृपा करें। "
     "इस हेतु मैं आपका आभारी रहूँगा।", False),
], size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=8)

# Para 4 – declaration
add_para(doc,
    "        मैं यह भी घोषित करता हूँ कि उपर्युक्त जमा राशियों के सम्बन्ध में मेरी ओर से "
    "विभाग का कोई बकाया देय नहीं है तथा सम्बन्धित कार्यों पर कोई विवाद लम्बित नहीं है।",
    size=12, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=24)

# Signature
add_para(doc, "भवदीय,", size=12, space_after=22)
add_para(doc, "नील कंठ शर्मा",   bold=True, size=12, space_after=2)
add_para(doc, "ठेकेदार, उदयपुर", size=12, space_after=2)
add_para(doc, "मोबाइल : ____________________", size=12, space_after=2)
add_para(doc, "पता      : __________________________", size=12, space_after=16)
add_para(doc, "संलग्नक : जमा रसीदों / वाउचरों की प्रतियाँ (उपलब्ध)",
         size=11, space_after=0)

doc.save(DOCX_PATH)
print(f"DOCX saved : {DOCX_PATH}")

# ── PDF via Word COM ──────────────────────────────────────────────────────────
try:
    import win32com.client
    tmp_dir  = tempfile.mkdtemp()
    tmp_docx = os.path.join(tmp_dir, "neel_kanth_temp.docx")
    tmp_pdf  = os.path.join(tmp_dir, "output.pdf")
    shutil.copy2(DOCX_PATH, tmp_docx)

    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    wdoc = word.Documents.Open(tmp_docx)
    wdoc.ExportAsFixedFormat(
        OutputFileName=tmp_pdf,
        ExportFormat=17,
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
    wdoc.Close(False)
    word.Quit()

    shutil.copy2(tmp_pdf, PDF_PATH)
    print(f"PDF  saved : {PDF_PATH}  ({os.path.getsize(PDF_PATH):,} bytes)")
except Exception as e:
    print(f"PDF ERROR  : {e}")

# ── Publish to public/docs/ + show Netlify URL ───────────────────────────────
HTML_PATH = os.path.join(OUT_DIR, "neel_kanth_deposit_refund_application.html")
publish_output(html_path=HTML_PATH, docx_path=DOCX_PATH, pdf_path=PDF_PATH)
