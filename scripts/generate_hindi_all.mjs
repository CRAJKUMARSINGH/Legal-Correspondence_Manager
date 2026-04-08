/**
 * Hindi PDF Generator — All 05_Bill letters
 * Covers: Letter1 (Bill Forwarding), Letter2 (Payment Demand+Interest),
 *         Bitumen Work (PMC/Seal Coat), Payment Reminder
 * Divisions: Dungarpur, Simalwara, Sagwara (where applicable)
 * Date: 10.04.2026
 */
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '05_Bill_Submission_Payment_Demand', 'Hindi')
fs.mkdirSync(OUT, { recursive: true })

// ── Shared data ───────────────────────────────────────────────────────────────
const RECEIVED_05 = 18562332   // Bills 1-4 (Letter1/Letter2)
const BILLS_05 = [
  { no:1, date:'18-05-2025', raw:'2025-05-18', gross:29256780 },
  { no:2, date:'19-11-2025', raw:'2025-11-19', gross:34882632 },
  { no:3, date:'22-12-2025', raw:'2025-12-22', gross:37738957 },
  { no:4, date:'18-01-2026', raw:'2026-01-18', gross:40595188 },
]
const CURRENT_GROSS = 42795925

const RECEIVED_REM = 20502520  // Payment Reminder bills
const BILLS_REM = [
  { no:1, date:'11-02-2025', raw:'2025-02-11', gross:29256780 },
  { no:2, date:'18-10-2025', raw:'2025-10-18', gross:37445888 },
  { no:3, date:'21-12-2025', raw:'2025-12-21', gross:42865469 },
  { no:4, date:'18-01-2026', raw:'2026-01-18', gross:48284956 },
]

const LETTER_DATE = new Date('2026-04-10')
const RATE = 18

function addMonth(d){ const r=new Date(d); r.setMonth(r.getMonth()+1); return r }
function fmtDate(d){ return d.toLocaleDateString('en-IN',{day:'2-digit',month:'2-digit',year:'numeric'}).replace(/\//g,'-') }
function inr(n){ return '₹\u00A0'+n.toLocaleString('en-IN') }

function calcRows(bills, received){
  const dueDates = bills.map(b=>addMonth(new Date(b.raw)))
  let totalInterest=0
  const rows = bills.map((b,i)=>{
    const net = b.gross - received
    const from = dueDates[i]
    const to = i<bills.length-1 ? dueDates[i+1] : LETTER_DATE
    const days = Math.max(0,Math.floor((to-from)/86400000))
    const interest = Math.round(net*RATE*days/36500)
    totalInterest += interest
    return {...b, net, dueDate:fmtDate(from), periodTo:fmtDate(to), days, interest}
  })
  const latestNet = bills[bills.length-1].gross - received
  return { rows, latestNet, totalInterest, grandTotal: latestNet+totalInterest }
}

const d05 = calcRows(BILLS_05, RECEIVED_05)
const currentNet = CURRENT_GROSS - RECEIVED_05
const grandTotal05 = d05.latestNet + d05.totalInterest + currentNet

const dRem = calcRows(BILLS_REM, RECEIVED_REM)

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans Devanagari', Arial, sans-serif; font-size: 12pt; color: #000; line-height: 1.85; }
  .header-bar { border-top: 3px solid #1e3570; border-bottom: 1px solid #1e3570; padding: 8px 0; margin-bottom: 16px; }
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 2px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 12px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 140px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 14px; line-height: 1.9; }
  .subject-line { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 14px 0 16px 0; line-height: 1.6; }
  .body-text { font-size: 11.5pt; line-height: 1.85; text-align: justify; }
  .body-text p { margin-bottom: 11px; }
  .body-text ol { margin: 8px 0 12px 24px; }
  .body-text ol li { margin-bottom: 7px; }
  .section-title { font-size: 11.5pt; font-weight: bold; text-decoration: underline; margin: 16px 0 8px 0; }
  .note { font-size: 9.5pt; color: #444; font-style: italic; margin: 4px 0 10px 0; }
  .info-box { border: 1.5px solid #1e3570; padding: 10px 16px; margin: 12px 0; background: #f7f9ff; font-size: 11.5pt; }
  .info-box table { border-collapse: collapse; width: 100%; }
  .info-box td { padding: 4px 8px; }
  .info-box td:last-child { text-align: right; font-weight: bold; }
  .info-box .total-row td { border-top: 2px solid #1e3570; font-weight: bold; font-size: 12pt; padding-top: 7px; }
  .claim-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 10px 0 14px 0; page-break-inside: avoid; }
  .claim-table th { background: #1e3570; color: #fff; padding: 6px 4px; text-align: center; border: 1px solid #1e3570; font-size: 9pt; line-height: 1.3; }
  .claim-table td { padding: 5px 4px; border: 1px solid #aaa; text-align: right; vertical-align: middle; white-space: nowrap; }
  .claim-table td.center { text-align: center; }
  .claim-table tr:nth-child(even) td { background: #f5f7ff; }
  .claim-table .total-row td { background: #e8ecf8; font-weight: bold; border-top: 2px solid #1e3570; }
  .summary-box { border: 2px solid #1e3570; padding: 10px 16px; margin: 14px 0; page-break-inside: avoid; }
  .summary-box table { border-collapse: collapse; width: 100%; font-size: 11.5pt; }
  .summary-box td { padding: 4px 8px; }
  .summary-box td:last-child { text-align: right; font-weight: bold; }
  .summary-box .grand td { border-top: 2px solid #1e3570; font-size: 13pt; font-weight: bold; padding-top: 8px; }
  .warn-box { border-left: 4px solid #c00; padding: 10px 14px; margin: 14px 0; background: #fff8f8; font-size: 11.5pt; }
  .warn-box ol { margin-left: 20px; }
  .warn-box ol li { margin-bottom: 6px; }
  .placeholder { background: #fffbe6; border-bottom: 1.5px solid #c80; padding: 0 4px; font-style: italic; }
  .sign-block { margin-top: 36px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 230px; }
  .sign-line { border-top: 1px solid #000; margin-top: 44px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
`

const GFONT = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">`

function header(firmHi='मेसर्स श्री बजरंग कंस्ट्रक्शन') {
  return `<div class="header-bar">
    <div class="firm-name">${firmHi}</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>`
}

function toBlock(toHi, ccHi) {
  return `<div class="to-block">सेवा में,<br><strong>${toHi.split('\n').join('<br>')}</strong><br><br>
  प्रतिलिपि: ${ccHi.split('\n').join('<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}</div>`
}

function signBlock() {
  return `<div class="sign-block clearfix"><div class="sign-right"><div class="sign-line">
    (मनोहर पटेल)<br>स्वामी / प्राधिकृत हस्ताक्षरकर्ता<br>मेसर्स श्री बजरंग कंस्ट्रक्शन
  </div></div></div>`
}

function tableRows(rows, received) {
  return rows.map(r=>`<tr>
    <td class="center">${r.no}</td><td class="center">${r.date}</td>
    <td>${inr(r.gross)}</td><td>${inr(received)}</td><td>${inr(r.net)}</td>
    <td class="center">${r.dueDate}</td><td class="center">${r.periodTo}</td>
    <td class="center">${r.days}</td><td>${inr(r.interest)}</td>
  </tr>`).join('')
}

function claimTable(rows, received, latestNet, totalInterest) {
  return `<table class="claim-table">
    <thead><tr>
      <th>बिल<br>क्र.</th><th>बिल<br>दिनांक</th><th>संचयी<br>सकल राशि (₹)</th>
      <th>प्राप्त राशि<br>(₹)</th><th>शुद्ध देय<br>(₹)</th><th>देय<br>दिनांक</th>
      <th>ब्याज अवधि<br>तक</th><th>दिन</th><th>ब्याज<br>@ 18% वार्षिक (₹)</th>
    </tr></thead>
    <tbody>${tableRows(rows,received)}
    <tr class="total-row">
      <td class="center" colspan="4">शुद्ध बकाया (बिल 4)</td>
      <td>${inr(latestNet)}</td><td class="center" colspan="3">कुल ब्याज</td>
      <td>${inr(totalInterest)}</td>
    </tr></tbody>
  </table>`
}

const warnCommon = `<div class="warn-box">
  <p><strong>चेतावनी — यदि 15 दिवस में भुगतान नहीं हुआ:</strong></p>
  <ol>
    <li>मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत <strong>मध्यस्थता कार्यवाही</strong>।</li>
    <li>सतर्कता विभाग / भ्रष्टाचार निरोधक ब्यूरो में <strong>शिकायत</strong>।</li>
    <li>सूचना का अधिकार अधिनियम के तहत <strong>आर.टी.आई. आवेदन</strong>।</li>
    <li>अनुबंध शर्तों के अंतर्गत <strong>कार्यस्थल पर कार्य स्थगन</strong>।</li>
    <li>भारतीय संविदा अधिनियम 1872 की धारा 73 के अंतर्गत <strong>अतिरिक्त क्षतिपूर्ति दावा</strong>।</li>
  </ol>
</div>`

// ── DIVISIONS ─────────────────────────────────────────────────────────────────
const DIV_DS = [
  { slug:'Dungarpur', l1:'SBC/PWD/2026/05-D-HI', l2:'SBC/PWD/2026/06-D-HI', l10:'SBC/PWD/2026/10-D-HI',
    to:'श्रीमान् अधिशासी अभियन्ता,\nलोक निर्माण विभाग खण्ड,\nडूंगरपुर (राज.)',
    cc:'1. अधीक्षण अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा\n2. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा' },
  { slug:'Simalwara', l1:'SBC/PWD/2026/05-S-HI', l2:'SBC/PWD/2026/06-S-HI', l10:'SBC/PWD/2026/10-S-HI',
    to:'श्रीमान् अधिशासी अभियन्ता,\nलोक निर्माण विभाग खण्ड,\nसिमलवाड़ा (राज.)',
    cc:'1. अधीक्षण अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा\n2. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा' },
]

const DIV_SAGWARA = [
  { slug:'Dungarpur', lno:'SBC/PWD/2026/09-D-HI',
    to:'श्रीमान् अधिशासी अभियन्ता,\nलोक निर्माण विभाग खण्ड,\nडूंगरपुर (राज.)',
    cc:'1. अधीक्षण अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा\n2. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा' },
  { slug:'Simalwara', lno:'SBC/PWD/2026/09-S-HI',
    to:'श्रीमान् अधिशासी अभियन्ता,\nलोक निर्माण विभाग खण्ड,\nसिमलवाड़ा (राज.)',
    cc:'1. अधीक्षण अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा\n2. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा' },
]

// ── LETTER 1 HINDI — Bill Forwarding ─────────────────────────────────────────
function letter1Hi(div) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${GFONT}<style>${CSS}</style></head><body>
  ${header()}
  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: ${div.l1}</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>
  ${toBlock(div.to, div.cc)}
  <div class="subject-line">
    विषय: रनिंग बिल क्रमांक 5 (सकल राशि ${inr(CURRENT_GROSS)}) प्रस्तुति —<br>
    अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण<br>
    अनुबंध क्रमांक AR/2023-24/1-D
  </div>
  <div class="body-text">
    <p>संदर्भ: कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023</p>
    <p>महोदय,</p>
    <p>उपरोक्त संदर्भित अनुबंध के अंतर्गत निष्पादित कार्य का रनिंग बिल क्रमांक 5 आपके अवलोकन, सत्यापन एवं भुगतान हेतु प्रस्तुत है।</p>
    <div class="info-box"><table>
      <tr><td>वर्तमान रनिंग बिल की सकल राशि (बिल क्र. 5)</td><td>${inr(CURRENT_GROSS)}</td></tr>
      <tr><td>अब तक प्राप्त कुल राशि</td><td>${inr(RECEIVED_05)}</td></tr>
      <tr class="total-row"><td>वर्तमान बिल की शुद्ध देय राशि</td><td>${inr(currentNet)}</td></tr>
    </table></div>
    <p>अनुबंध की शर्तों के अनुसार उक्त बिल का भुगतान प्रस्तुति के <strong>एक माह के भीतर</strong> अर्थात् <strong>10.05.2026</strong> तक किया जाना अपेक्षित है।</p>
    <p>इसके अतिरिक्त, पूर्व के रनिंग बिल क्रमांक 1 से 4 की बकाया राशि पर 18% वार्षिक ब्याज सहित विस्तृत मांग हमारे पत्र क्रमांक ${div.l2} दिनांक 10.04.2026 में प्रस्तुत है।</p>
    <div class="info-box"><table>
      <tr><td>(i) वर्तमान बिल क्र. 5 की शुद्ध देय राशि (${inr(CURRENT_GROSS)} − ${inr(RECEIVED_05)})</td><td>${inr(currentNet)}</td></tr>
      <tr><td>(ii) पूर्व बिल क्र. 1-4 की शुद्ध बकाया मूल राशि</td><td>${inr(d05.latestNet)}</td></tr>
      <tr><td>(iii) 18% वार्षिक ब्याज (पत्र क्र. ${div.l2} दि. 10.04.2026 अनुसार)</td><td>${inr(d05.totalInterest)}</td></tr>
      <tr class="total-row"><td><strong>तत्काल देय कुल राशि</strong></td><td><strong>${inr(grandTotal05)}</strong></td></tr>
    </table></div>
    <p>कृपया उक्त कुल राशि <strong>${inr(grandTotal05)}</strong> का तत्काल भुगतान सुनिश्चित करें एवं इस पत्र की प्राप्ति स्वीकार करें।</p>
  </div>
  ${signBlock()}
  </body></html>`
}

// ── LETTER 2 HINDI — Payment Demand + Interest Table ─────────────────────────
function letter2Hi(div) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${GFONT}<style>${CSS}</style></head><body>
  ${header()}
  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: ${div.l2}</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>
  ${toBlock(div.to, div.cc)}
  <div class="subject-line">
    विषय: लंबित रनिंग बिलों का 18% वार्षिक ब्याज सहित तत्काल भुगतान की मांग —<br>
    अनुबंध क्रमांक AR/2023-24/1-D
  </div>
  <div class="body-text">
    <p>संदर्भ:<br>
    1. अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. हमारा पत्र क्र. 237 दि. 10.07.2025 | 3. पत्र क्र. 337 दि. 15.10.2025<br>
    4. पत्र क्र. 1133 दि. 19.11.2025 | 5. पत्र क्र. JJ 32 दि. 20.11.2025<br>
    6. हमारा पत्र क्र. ${div.l1} दि. 10.04.2026 (बिल क्र. 5 प्रेषण)</p>
    <p>महोदय,</p>
    <p>उपरोक्त अनुबंध के अंतर्गत <strong>अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण कार्य</strong> के लंबित रनिंग बिलों की समस्त देय राशि ब्याज सहित तत्काल भुगतान की औपचारिक मांग प्रस्तुत है।</p>
    <div class="section-title">1. पृष्ठभूमि</div>
    <p>हमारे रनिंग बिल संचयी प्रकृति के हैं। विभाग द्वारा अब तक केवल ${inr(RECEIVED_05)} की एकमुश्त राशि प्राप्त हुई है। अनुबंध की शर्तों के अनुसार प्रत्येक रनिंग बिल का भुगतान प्रस्तुति के <strong>एक माह के भीतर</strong> किया जाना अनिवार्य है। विलंब पर भारतीय संविदा अधिनियम 1872 की धारा 73 एवं 74 के अंतर्गत 18% वार्षिक ब्याज देय है।</p>
    <div class="section-title">2. लंबित बिलों का ब्याज सहित विवरण (दिनांक 10.04.2026 तक)</div>
    <p class="note">नोट: शुद्ध देय = संचयी सकल − प्राप्त राशि। ब्याज: प्रत्येक बिल की देय तिथि से अगले बिल की देय तिथि तक (अंतिम बिल — पत्र दिनांक तक)। दर: 18% वार्षिक | सूत्र: शुद्ध देय × 18% ÷ 365 × दिन</p>
    ${claimTable(d05.rows, RECEIVED_05, d05.latestNet, d05.totalInterest)}
    <div class="section-title">3. कुल दावा सारांश</div>
    <div class="summary-box"><table>
      <tr><td>(A) शुद्ध बकाया मूल राशि — बिल 4 (${inr(BILLS_05[3].gross)} − ${inr(RECEIVED_05)})</td><td>${inr(d05.latestNet)}</td></tr>
      <tr><td>(B) कुल अर्जित ब्याज @ 18% वार्षिक</td><td>${inr(d05.totalInterest)}</td></tr>
      <tr><td>(C) वर्तमान बिल क्र. 5 की शुद्ध राशि (दि. 10.04.2026 — ब्याज रहित)</td><td>${inr(currentNet)}</td></tr>
      <tr class="grand"><td>कुल दावा राशि (A + B + C)</td><td>${inr(grandTotal05)}</td></tr>
    </table></div>
    <div class="section-title">4. औपचारिक मांग</div>
    <p>हम इस पत्र के दिनांक से <strong>पंद्रह (15) दिवस के भीतर</strong> अर्थात् <strong>25.04.2026</strong> तक कुल राशि <strong>${inr(grandTotal05)}</strong> के भुगतान की औपचारिक मांग करते हैं।</p>
    ${warnCommon}
    <p>आशा है आप इस विषय को गंभीरता से लेते हुए तत्काल कार्यवाही करेंगे।</p>
  </div>
  ${signBlock()}
  </body></html>`
}

// ── BITUMEN LETTER HINDI ──────────────────────────────────────────────────────
function bitumenHi(div) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${GFONT}<style>${CSS}</style></head><body>
  ${header()}
  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: ${div.lno}</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>
  ${toBlock(div.to, div.cc)}
  <div class="subject-line">
    विषय: अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण —<br>
    अनुबंध क्रमांक AR/2023-24/1-D — चेनेज <span class="placeholder">Z1</span> से
    <span class="placeholder">Z2</span> में लंबित पी.एम.सी. एवं सील कोट कार्य —<br>
    कार्यादेश राशि की समाप्ति एवं विचलन स्वीकृति तथा अनंतिम समय विस्तार हेतु अनुरोध
  </div>
  <div class="body-text">
    <p>संदर्भ: कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023</p>
    <p>महोदय,</p>
    <p>उपरोक्त अनुबंध के संदर्भ में चेनेज <span class="placeholder">Z1</span> से <span class="placeholder">Z2</span> में लंबित पी.एम.सी. (प्रीमिक्स कार्पेट) एवं सील कोट कार्य के संबंध में निम्नलिखित महत्वपूर्ण तथ्य आपके संज्ञान में लाना आवश्यक है।</p>
    <p><strong>1. कार्यादेश राशि की समाप्ति</strong></p>
    <div class="info-box"><table>
      <tr><td>मूल कार्यादेश / अनुबंध राशि</td><td>₹ 3,92,24,443.00 (9.05% नीचे)</td></tr>
      <tr><td>कार्य प्रारंभ दिनांक</td><td>28.07.2023</td></tr>
      <tr><td>निर्धारित पूर्णता दिनांक</td><td>28.01.2024</td></tr>
      <tr><td>अब तक साइट पर निष्पादित कार्य की कुल राशि<br>(अब तक निर्देशित समस्त विचलनों सहित)</td><td>₹ 4,27,95,925.00</td></tr>
      <tr class="total-row"><td>कार्यादेश राशि से अधिक निष्पादित राशि</td><td>₹ 35,71,482.00</td></tr>
    </table></div>
    <p><strong>2. लंबित बिटुमिनस कार्य की स्थिति</strong></p>
    <p>साइट पर निष्पादित कार्य की राशि <strong>₹ 4,27,95,925/-</strong> मूल कार्यादेश राशि <strong>₹ 3,92,24,443/-</strong> से <strong>₹ 35,71,482/-</strong> अधिक हो चुकी है। इस पृष्ठभूमि में, चेनेज <span class="placeholder">Z1</span> से <span class="placeholder">Z2</span> में पी.एम.सी. एवं सील कोट कार्य लंबित है। अनुबंध की वित्तीय अनुशासन का सम्मान करते हुए एवं हमारी फर्म के संविदात्मक अधिकारों की रक्षा हेतु, <strong>पूर्व-स्वीकृत विचलन प्राप्त हुए बिना उक्त बिटुमिनस कार्य निष्पादित करना हमारे लिए संभव नहीं है।</strong></p>
    <p><strong>3. विचलन स्वीकृति एवं अनंतिम समय विस्तार हेतु अनुरोध</strong></p>
    <ol>
      <li>कृपया ₹ 35,71,482/- की अधिक निष्पादित राशि एवं चेनेज <span class="placeholder">Z1</span> से <span class="placeholder">Z2</span> के लंबित पी.एम.सी. एवं सील कोट कार्य की लागत को सम्मिलित करते हुए <strong>विचलन विवरण (Deviation Statement) सक्षम प्राधिकारी से एक माह के भीतर</strong> अर्थात् <strong>10.05.2026</strong> तक स्वीकृत करवाएं।</li>
      <li>साथ ही, विभागीय कारणों (विचलन स्वीकृति लंबित, रनिंग बिल भुगतान न होना, वन भूमि क्लीयरेंस विलंब, सिंचाई विभाग एन.ओ.सी.) से हुए विलंब के लिए उचित अवधि का <strong>अनंतिम समय विस्तार (Provisional Time Extension)</strong> भी प्रदान करें।</li>
    </ol>
    <div class="warn-box">
      <p><strong>महत्वपूर्ण सूचना:</strong></p>
      <p>यदि उपरोक्त पूर्व-स्वीकृत विचलन विवरण <strong>एक माह (10.05.2026)</strong> तक प्राप्त नहीं होता, तो हम चेनेज <span class="placeholder">Z1</span> से <span class="placeholder">Z2</span> में लंबित पी.एम.सी. एवं सील कोट कार्य निष्पादित करने के लिए बाध्य नहीं होंगे। पूर्व-स्वीकृत विचलन एवं अनंतिम समय विस्तार प्राप्त होते ही हम उक्त कार्य तत्काल प्रारंभ करने हेतु तैयार हैं।</p>
    </div>
    <p>कृपया इस पत्र की प्राप्ति स्वीकार करें एवं इस विषय को अत्यावश्यक मानते हुए कार्यवाही करें।</p>
  </div>
  ${signBlock()}
  </body></html>`
}

// ── PAYMENT REMINDER HINDI ────────────────────────────────────────────────────
function reminderHi(div) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">${GFONT}<style>${CSS}</style></head><body>
  ${header()}
  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: ${div.l10}</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>
  ${toBlock(div.to, div.cc)}
  <div class="subject-line">
    विषय: स्मरण पत्र — लंबित रनिंग बिलों का 18% वार्षिक ब्याज सहित तत्काल भुगतान —<br>
    अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण —<br>
    अनुबंध क्रमांक AR/2023-24/1-D
  </div>
  <div class="body-text">
    <p>संदर्भ: अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023 एवं पूर्व पत्राचार</p>
    <p>महोदय,</p>
    <p>उपरोक्त अनुबंध के अंतर्गत लंबित रनिंग बिलों के भुगतान हेतु यह औपचारिक <strong>स्मरण पत्र</strong> प्रस्तुत है। पूर्व पत्राचार के बावजूद बकाया राशि का भुगतान नहीं किया गया है।</p>
    <div class="section-title">1. लंबित बिलों का ब्याज सहित विवरण (दिनांक 10.04.2026 तक)</div>
    <p class="note">नोट: शुद्ध देय = संचयी सकल − प्राप्त राशि। ब्याज: देय तिथि से अगले बिल की देय तिथि तक (अंतिम बिल — पत्र दिनांक तक)। दर: 18% वार्षिक</p>
    ${claimTable(dRem.rows, RECEIVED_REM, dRem.latestNet, dRem.totalInterest)}
    <div class="section-title">2. कुल दावा सारांश</div>
    <div class="summary-box"><table>
      <tr><td>(A) शुद्ध बकाया मूल राशि — बिल 4 (${inr(BILLS_REM[3].gross)} − ${inr(RECEIVED_REM)})</td><td>${inr(dRem.latestNet)}</td></tr>
      <tr><td>(B) कुल अर्जित ब्याज @ 18% वार्षिक</td><td>${inr(dRem.totalInterest)}</td></tr>
      <tr class="grand"><td>कुल दावा राशि (A + B)</td><td>${inr(dRem.grandTotal)}</td></tr>
    </table></div>
    <div class="section-title">3. औपचारिक मांग</div>
    <p>इस पत्र के दिनांक से <strong>पंद्रह (15) दिवस के भीतर</strong> अर्थात् <strong>25.04.2026</strong> तक कुल राशि <strong>${inr(dRem.grandTotal)}</strong> का भुगतान करने की औपचारिक मांग की जाती है।</p>
    ${warnCommon}
    <p>आशा है आप इस विषय को गंभीरता से लेते हुए तत्काल कार्यवाही करेंगे।</p>
  </div>
  ${signBlock()}
  </body></html>`
}

// ── Generate ──────────────────────────────────────────────────────────────────
async function makePDF(html, filename) {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const outPath = path.join(OUT, filename)
  await page.pdf({ path: outPath, format: 'A4', printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '20mm' },
    preferCSSPageSize: false })
  await browser.close()
  console.log('✓', filename)
}

console.log('\nGenerating Hindi PDFs...\n')

for (const div of DIV_DS) {
  await makePDF(letter1Hi(div),  `Letter1_BillForwarding_Hindi_${div.slug}_10Apr2026.pdf`)
  await makePDF(letter2Hi(div),  `Letter2_PaymentDemand_Hindi_${div.slug}_10Apr2026.pdf`)
  await makePDF(reminderHi(div), `Letter_PaymentReminder_Hindi_${div.slug}_10Apr2026.pdf`)
}

for (const div of DIV_SAGWARA) {
  await makePDF(bitumenHi(div), `Letter_BitumenWork_Hindi_${div.slug}_10Apr2026.pdf`)
}

console.log('\nDone. All Hindi PDFs saved to:\n', OUT)
