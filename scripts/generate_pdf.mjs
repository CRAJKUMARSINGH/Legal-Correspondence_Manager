/**
 * PDF Generator — Bajrang Construction
 * Generates 4 PDFs:
 *   Letter 1 (Forwarding) × 2 divisions
 *   Letter 2 (Demand + Interest Table) × 2 divisions
 * Divisions: PWD Division Dungarpur | PWD Division Simalwara
 * A4, Times New Roman, no CSS shrink
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '05_Bill_Submission_Payment_Demand')
fs.mkdirSync(OUT, { recursive: true })

// ── Data ─────────────────────────────────────────────────────────────────────
const RECEIVED = 18562332
const BILLS = [
  { no: 1, date: '18-05-2025', gross: 29256780 },
  { no: 2, date: '19-11-2025', gross: 34882632 },
  { no: 3, date: '22-12-2025', gross: 37738957 },
  { no: 4, date: '18-01-2026', gross: 40595188 },
]
const CURRENT = { date: '10-04-2026', gross: 42795925 }
const LETTER_DATE = new Date('2026-04-10')
const RATE = 18

function parseDate(d) {
  const [dd, mm, yyyy] = d.split('-')
  return new Date(`${yyyy}-${mm}-${dd}`)
}

function inr(n) {
  return '₹\u00A0' + n.toLocaleString('en-IN')
}

function addMonth(d) {
  const r = new Date(d)
  r.setMonth(r.getMonth() + 1)
  return r
}

// Correct: period-wise interest on RUNNING NET OUTSTANDING
// Net Due at each bill = Cumulative Gross − Amount Received till that bill date
// Interest on that net due runs from its due date until the NEXT bill's due date
// (last bill runs to letter date)
function computeRows() {
  const rows = []
  let totalInterest = 0

  const dueDates = BILLS.map(b => addMonth(parseDate(b.date)))

  for (let i = 0; i < BILLS.length; i++) {
    const b = BILLS[i]
    const net = b.gross - RECEIVED           // cumulative gross − total received
    const dueDate = dueDates[i]
    const periodEnd = i < BILLS.length - 1 ? dueDates[i + 1] : LETTER_DATE
    const days = Math.max(0, Math.floor((periodEnd - dueDate) / 86400000))
    const interest = Math.round(net * RATE * days / 36500)
    totalInterest += interest

    rows.push({
      no: b.no,
      date: b.date,
      gross: b.gross,
      received: RECEIVED,
      net,
      dueDate: dueDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      periodEnd: periodEnd.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-'),
      days,
      interest,
    })
  }

  const latestNet = BILLS[BILLS.length - 1].gross - RECEIVED
  const currentNet = CURRENT.gross - RECEIVED   // same formula: cumulative gross − total received
  return { rows, latestNet, totalInterest, currentNet }
}

const { rows, latestNet, totalInterest, currentNet } = computeRows()
const grandTotal = latestNet + totalInterest + currentNet

// ── Shared CSS ────────────────────────────────────────────────────────────────
const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    line-height: 1.6;
    width: 100%;
  }
  .page { width: 100%; }
  .header-bar {
    border-top: 3px solid #1e3570;
    border-bottom: 1px solid #1e3570;
    padding: 8px 0;
    margin-bottom: 14px;
  }
  .firm-name {
    font-size: 15pt;
    font-weight: bold;
    color: #1e3570;
    letter-spacing: 1px;
  }
  .firm-sub { font-size: 10pt; color: #333; }
  .meta-block { margin: 10px 0 14px 0; font-size: 11pt; }
  .meta-block table { border-collapse: collapse; width: 100%; }
  .meta-block td { padding: 1px 6px 1px 0; vertical-align: top; }
  .meta-block td:first-child { width: 130px; font-weight: bold; white-space: nowrap; }
  .subject-line {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 14px 0 12px 0;
    line-height: 1.5;
  }
  .body-text { font-size: 11.5pt; line-height: 1.75; text-align: justify; }
  .body-text p { margin-bottom: 10px; }
  .body-text ol { margin: 8px 0 8px 22px; }
  .body-text ol li { margin-bottom: 6px; }
  .section-title {
    font-size: 11.5pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 16px 0 8px 0;
  }
  .amount-box {
    border: 1px solid #1e3570;
    padding: 8px 14px;
    margin: 10px 0;
    background: #f7f9ff;
    font-size: 11.5pt;
  }
  .amount-box table { border-collapse: collapse; width: 100%; }
  .amount-box td { padding: 3px 8px; }
  .amount-box td:last-child { text-align: right; font-weight: bold; }
  .amount-box .total-row td {
    border-top: 2px solid #1e3570;
    font-weight: bold;
    font-size: 12pt;
    padding-top: 6px;
  }
  /* CLAIM TABLE */
  .claim-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 10pt;
    margin: 10px 0 14px 0;
    page-break-inside: avoid;
  }
  .claim-table th {
    background: #1e3570;
    color: #fff;
    padding: 6px 5px;
    text-align: center;
    border: 1px solid #1e3570;
    font-size: 9.5pt;
    line-height: 1.3;
  }
  .claim-table td {
    padding: 5px 5px;
    border: 1px solid #aaa;
    text-align: right;
    vertical-align: middle;
    white-space: nowrap;
  }
  .claim-table td.center { text-align: center; }
  .claim-table td.left { text-align: left; }
  .claim-table tr:nth-child(even) td { background: #f5f7ff; }
  .claim-table .total-row td {
    background: #e8ecf8;
    font-weight: bold;
    border-top: 2px solid #1e3570;
    font-size: 10.5pt;
  }
  .claim-table .grand-row td {
    background: #1e3570;
    color: #fff;
    font-weight: bold;
    font-size: 11pt;
    border: 1px solid #1e3570;
  }
  .note { font-size: 9.5pt; color: #444; margin: 4px 0 10px 0; font-style: italic; }
  .summary-box {
    border: 2px solid #1e3570;
    padding: 10px 16px;
    margin: 14px 0;
    page-break-inside: avoid;
  }
  .summary-box table { border-collapse: collapse; width: 100%; font-size: 11.5pt; }
  .summary-box td { padding: 4px 8px; }
  .summary-box td:last-child { text-align: right; font-weight: bold; }
  .summary-box .grand td {
    border-top: 2px solid #1e3570;
    font-size: 13pt;
    font-weight: bold;
    padding-top: 8px;
  }
  .divider { border: none; border-top: 1px solid #1e3570; margin: 14px 0; }
  .sign-block { margin-top: 30px; font-size: 11.5pt; }
  .sign-block .sign-right { float: right; text-align: center; width: 220px; }
  .sign-block .sign-right .sign-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 4px; }
  .encl { font-size: 10.5pt; margin-top: 20px; }
  .encl p { margin-bottom: 3px; }
  .legal-warn {
    border-left: 4px solid #c00;
    padding: 8px 12px;
    margin: 12px 0;
    font-size: 11pt;
    background: #fff8f8;
  }
  .legal-warn ol { margin-left: 18px; }
  .legal-warn ol li { margin-bottom: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
`

// ── DIVISIONS ─────────────────────────────────────────────────────────────────
const DIVISIONS = [
  {
    slug: 'Dungarpur',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nDungarpur (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
    l1no: 'SBC/PWD/2026/05-D',
    l2no: 'SBC/PWD/2026/06-D',
  },
  {
    slug: 'Simalwara',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nSimalwara (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
    l1no: 'SBC/PWD/2026/05-S',
    l2no: 'SBC/PWD/2026/06-S',
  },
]

function toLines(str) {
  return str.split('\n').join('<br>')
}

// ── LETTER 1 HTML ─────────────────────────────────────────────────────────────
function letter1HTML(div) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${CSS}</style>
</head><body>
<div class="page">

  <div class="header-bar">
    <div class="firm-name">M/s SHRI BAJRANG CONSTRUCTION</div>
    <div class="firm-sub">"AA" Class PWD Contractor &nbsp;|&nbsp; Padli Gujreshwar, Distt. Dungarpur (Raj.)</div>
  </div>

  <div class="meta-block">
    <table>
      <tr><td>Letter No.</td><td>: ${div.l1no}</td></tr>
      <tr><td>Date</td><td>: 10.04.2026</td></tr>
    </table>
  </div>

  <div class="meta-block">
    <table>
      <tr><td style="width:50px">To,</td><td><b>${toLines(div.to)}</b></td></tr>
    </table>
    <br>
    <table>
      <tr><td style="width:50px">CC:</td><td>${toLines(div.cc)}</td></tr>
    </table>
  </div>

  <div class="subject-line">
    Subject: Submission of Running Bill No. 5 (Gross Amount ${inr(CURRENT.gross)}) for<br>
    Construction of Amli Fala Bridge — Contract No. AR/2023-24/1-D
  </div>

  <div class="body-text">
    <p>Reference: Work Order / Contract No. AR/2023-24/1-D dated 17.07.2023<br>
    Work: Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road</p>

    <p>Sir,</p>

    <p>With reference to the above-cited contract, we hereby submit our Running Bill No. 5
    for the work executed up to date for your kind perusal, verification, and payment.</p>

    <div class="amount-box">
      <table>
        <tr><td>Gross Amount of Current Running Bill (Bill No. 5)</td><td>${inr(CURRENT.gross)}</td></tr>
        <tr><td>Total Amount Received to Date</td><td>${inr(RECEIVED)}</td></tr>
        <tr class="total-row"><td>Net Amount Payable (Current Bill)</td><td>${inr(currentNet)}</td></tr>
      </table>
    </div>

    <p>You are requested to kindly arrange to check, verify, and pass the above Running Bill
    for payment at the earliest. As per the terms of the Agreement, payment is due within
    <b>one month</b> of submission of the bill, i.e., on or before <b>10.05.2026</b>.</p>

    <p>In addition to the above current bill, our previous Running Bills (Nos. 1–4) remain
    unpaid beyond the stipulated period, attracting interest @ 18% p.a. as detailed in our
    separate demand letter No. ${div.l2no} dated 10.04.2026 submitted herewith.</p>

    <div class="amount-box">
      <table>
        <tr><td>(i)&nbsp; Net Amount of Current Bill No. 5 (Gross ${inr(CURRENT.gross)} − Received ${inr(RECEIVED)})</td><td>${inr(currentNet)}</td></tr>
        <tr><td>(ii)&nbsp; Net Outstanding on Previous Bills (Nos. 1–4)</td><td>${inr(latestNet)}</td></tr>
        <tr><td>(iii) Interest Accrued @ 18% p.a. on Previous Bills<br>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(as per Letter No. ${div.l2no} dated 10.04.2026)</td><td>${inr(totalInterest)}</td></tr>
        <tr class="total-row">
          <td><b>TOTAL AMOUNT PAYABLE IMMEDIATELY</b></td>
          <td><b>${inr(grandTotal)}</b></td>
        </tr>
      </table>
    </div>

    <p>Kindly arrange to release the total amount of <b>${inr(grandTotal)}</b> immediately
    and acknowledge receipt of this bill.</p>
  </div>

  <div class="sign-block clearfix">
    <div class="sign-right">
      <div class="sign-line">
        (Manohar Patel)<br>
        Proprietor / Auth. Signatory<br>
        M/s Shri Bajrang Construction
      </div>
    </div>
  </div>

  <div class="encl">
    <p><b>Enclosures:</b></p>
    <p>1. Running Bill No. 5 with measurements (Gross ${inr(CURRENT.gross)})</p>
    <p>2. Letter No. ${div.l2no} dated 10.04.2026 (Payment Demand with Interest)</p>
    <p>3. Copy of Work Order / Agreement No. AR/2023-24/1-D</p>
  </div>

</div>
</body></html>`
}

// ── LETTER 2 HTML ─────────────────────────────────────────────────────────────
const tableRows = rows.map(r => `
  <tr>
    <td class="center">${r.no}</td>
    <td class="center">${r.date}</td>
    <td>${inr(r.gross)}</td>
    <td>${inr(r.received)}</td>
    <td>${inr(r.net)}</td>
    <td class="center">${r.dueDate}</td>
    <td class="center">${r.periodEnd}</td>
    <td class="center">${r.days}</td>
    <td>${inr(r.interest)}</td>
  </tr>`).join('')

const letter2HTML = (div) => `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${CSS}</style>
</head><body>
<div class="page">

  <div class="header-bar">
    <div class="firm-name">M/s SHRI BAJRANG CONSTRUCTION</div>
    <div class="firm-sub">"AA" Class PWD Contractor &nbsp;|&nbsp; Padli Gujreshwar, Distt. Dungarpur (Raj.)</div>
  </div>

  <div class="meta-block">
    <table>
      <tr><td>Letter No.</td><td>: ${div.l2no}</td></tr>
      <tr><td>Date</td><td>: 10.04.2026</td></tr>
    </table>
  </div>

  <div class="meta-block">
    <table>
      <tr><td style="width:50px">To,</td><td><b>${toLines(div.to)}</b></td></tr>
    </table>
    <br>
    <table>
      <tr><td style="width:50px">CC:</td><td>${toLines(div.cc)}</td></tr>
    </table>
  </div>

  <div class="subject-line">
    Subject: Demand for Immediate Payment of Outstanding Running Bills with Interest<br>
    @ 18% p.a. — Contract No. AR/2023-24/1-D
  </div>

  <div class="body-text">
    <p>Reference:
      <br>1. Work Order / Contract No. AR/2023-24/1-D dated 17.07.2023
      <br>2. Our Letter No. 237 dated 10.07.2025
      <br>3. Our Letter No. 337 dated 15.10.2025
      <br>4. Our Letter No. 1133 dated 19.11.2025
      <br>5. Our Letter No. JJ 32 dated 20.11.2025
      <br>6. Our Letter No. ${div.l1no} dated 10.04.2026 (Bill No. 5 forwarding)
    </p>

    <p>Sir,</p>

    <p>With reference to the above-cited contract for <b>Construction of Amli Fala Bridge
    and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road</b>, we submit
    this formal demand for payment of all outstanding dues with interest.</p>

    <div class="section-title">1. BACKGROUND</div>
    <p>Our Running Bills are cumulative in nature — each bill reflects the total gross
    value of work executed up to that date. The Department has made only one payment
    of ${inr(RECEIVED)} to date. The net outstanding amount has been growing with each
    successive bill submission, as tabulated below.</p>

    <p>As per the Agreement, the Department is obligated to pay each Running Bill within
    <b>one month</b> of submission. Non-payment beyond this period attracts interest
    @ 18% per annum under Section 73 &amp; 74 of the Indian Contract Act, 1872.</p>

    <div class="section-title">2. STATEMENT OF OUTSTANDING BILLS WITH INTEREST (as on 10.04.2026)</div>
    <p class="note">Note: Bills are cumulative — Net Due = Cumulative Gross minus Amount Received till that bill date.
    Interest is calculated on the Net Due for the period from its due date (bill date + 1 month) to the next bill's
    due date (last bill runs to letter date 10.04.2026). Rate: 18% p.a. | Formula: Net Due × 18% ÷ 365 × Days</p>

    <table class="claim-table">
      <thead>
        <tr>
          <th>Bill<br>No.</th>
          <th>Bill<br>Date</th>
          <th>Cumulative<br>Gross (₹)</th>
          <th>Amt Received<br>till Bill Date (₹)</th>
          <th>Net Due<br>(₹)</th>
          <th>Due<br>Date</th>
          <th>Interest<br>Period To</th>
          <th>Days</th>
          <th>Interest<br>@ 18% p.a. (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="total-row">
          <td class="center" colspan="4">Net Outstanding (Bill 4)</td>
          <td>${inr(latestNet)}</td>
          <td class="center" colspan="3">Total Interest</td>
          <td>${inr(totalInterest)}</td>
        </tr>
      </tbody>
    </table>

    <div class="section-title">3. SUMMARY OF TOTAL AMOUNT CLAIMED</div>

    <div class="summary-box">
      <table>
        <tr>
          <td>(A) Net Outstanding Principal — Bill 4 (₹4,05,95,188 − ₹1,85,62,332)</td>
          <td>${inr(latestNet)}</td>
        </tr>
        <tr>
          <td>(B) Total Interest Accrued @ 18% p.a. (period-wise on running net)</td>
          <td>${inr(totalInterest)}</td>
        </tr>
        <tr>
          <td>(C) Net Amount of Current Bill No. 5 (₹4,27,95,925 − ₹1,85,62,332)</td>
          <td>${inr(currentNet)}</td>
        </tr>
        <tr class="grand">
          <td>GRAND TOTAL CLAIMED (A + B + C)</td>
          <td>${inr(grandTotal)}</td>
        </tr>
      </table>
    </div>

    <p><b>Grand Total in Words:</b> Rupees Two Crore Sixty Four Lakh Eighty Seven Thousand
    One Hundred Twenty Seven Only (₹ ${grandTotal.toLocaleString('en-IN')}/-)</p>

    <div class="section-title">4. FORMAL DEMAND</div>
    <p>We hereby formally demand payment of the Grand Total of <b>${inr(grandTotal)}</b>
    within <b>FIFTEEN (15) DAYS</b> from the date of this letter, i.e., on or before
    <b>25.04.2026</b>.</p>

    <div class="legal-warn">
      <p><b>Consequences of Non-Compliance (if dues not cleared by 25.04.2026):</b></p>
      <ol>
        <li>Initiation of <b>Arbitration proceedings</b> under the Arbitration &amp;
        Conciliation Act, 1996 as per the contract clause.</li>
        <li>Complaint to the <b>Vigilance Department / Anti-Corruption Bureau</b>
        against the concerned officers for willful non-payment and dereliction of duty.</li>
        <li>Filing of <b>RTI Application</b> to ascertain reasons for deliberate delay.</li>
        <li><b>Suspension of work</b> at site under the contract terms until dues are cleared.</li>
        <li>Claim for <b>additional consequential damages</b> including work stoppage losses
        under Section 73 of the Indian Contract Act, 1872.</li>
      </ol>
    </div>

    <p>We trust you will treat this matter with the urgency it deserves.</p>
  </div>

  <div class="sign-block clearfix">
    <div class="sign-right">
      <div class="sign-line">
        (Manohar Patel)<br>
        Proprietor / Auth. Signatory<br>
        M/s Shri Bajrang Construction
      </div>
    </div>
  </div>

  <div class="encl">
    <p><b>Enclosures:</b></p>
    <p>1. Copies of Running Bills 1–5 with submission dates</p>
    <p>2. Copies of previous correspondence (Ref. Nos. as cited above)</p>
    <p>3. Copy of Agreement No. AR/2023-24/1-D</p>
  </div>

</div>
</body></html>`

// ── Generate PDFs ─────────────────────────────────────────────────────────────
async function makePDF(html, filename) {
  const browser = await puppeteer.launch({ headless: 'new' })
  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'networkidle0' })
  const outPath = path.join(OUT, filename)
  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', bottom: '20mm', left: '25mm', right: '20mm' },
    preferCSSPageSize: false,
  })
  await browser.close()
  console.log('✓ Generated:', outPath)
}

console.log('\nGenerating 4 PDFs (2 letters × 2 divisions)...\n')
for (const div of DIVISIONS) {
  await makePDF(letter1HTML(div), `Letter1_BillForwarding_${div.slug}_10Apr2026.pdf`)
  await makePDF(letter2HTML(div), `Letter2_PaymentDemand_${div.slug}_10Apr2026.pdf`)
}
console.log('\nDone. All 4 PDFs saved to:\n', OUT)
