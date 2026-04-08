/**
 * Payment Reminder — EE PWD Baneshwar Dham
 * Cumulative bills with period-wise interest @ 18% p.a.
 * Date: 10.04.2026
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '05_Bill_Submission_Payment_Demand')

// ── Data ──────────────────────────────────────────────────────────────────────
const RECEIVED = 20502520
const BILLS = [
  { no: 1, date: '11-02-2025', raw: '2025-02-11', gross: 29256780 },
  { no: 2, date: '18-10-2025', raw: '2025-10-18', gross: 37445888 },
  { no: 3, date: '21-12-2025', raw: '2025-12-21', gross: 42865469 },
  { no: 4, date: '18-01-2026', raw: '2026-01-18', gross: 48284956 },
]
const LETTER_DATE = new Date('2026-04-10')
const RATE = 18

function addMonth(d) { const r = new Date(d); r.setMonth(r.getMonth() + 1); return r }
function fmtDate(d) {
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-')
}
function inr(n) { return '₹\u00A0' + n.toLocaleString('en-IN') }

// Period-wise interest
const dueDates = BILLS.map(b => addMonth(new Date(b.raw)))
let totalInterest = 0
const rows = BILLS.map((b, i) => {
  const net = b.gross - RECEIVED
  const from = dueDates[i]
  const to = i < BILLS.length - 1 ? dueDates[i + 1] : LETTER_DATE
  const days = Math.max(0, Math.floor((to - from) / 86400000))
  const interest = Math.round(net * RATE * days / 36500)
  totalInterest += interest
  return { ...b, net, dueDate: fmtDate(from), periodTo: fmtDate(to), days, interest }
})

const latestNet = BILLS[3].gross - RECEIVED
const grandTotal = latestNet + totalInterest

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.75; }
  .header-bar { border-top: 3px solid #1e3570; border-bottom: 1px solid #1e3570; padding: 8px 0; margin-bottom: 16px; }
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; letter-spacing: 0.5px; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 2px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 12px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 130px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 14px; line-height: 1.9; }
  .subject-line { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 14px 0 16px 0; line-height: 1.6; }
  .body-text { font-size: 11.5pt; line-height: 1.8; text-align: justify; }
  .body-text p { margin-bottom: 11px; }
  .body-text ol { margin: 8px 0 12px 24px; }
  .body-text ol li { margin-bottom: 7px; }
  .section-title { font-size: 11.5pt; font-weight: bold; text-decoration: underline; margin: 16px 0 8px 0; }
  .note { font-size: 9.5pt; color: #444; font-style: italic; margin: 4px 0 10px 0; }
  .claim-table { width: 100%; border-collapse: collapse; font-size: 9.5pt; margin: 10px 0 14px 0; page-break-inside: avoid; }
  .claim-table th { background: #1e3570; color: #fff; padding: 6px 5px; text-align: center; border: 1px solid #1e3570; font-size: 9pt; line-height: 1.3; }
  .claim-table td { padding: 5px 5px; border: 1px solid #aaa; text-align: right; vertical-align: middle; white-space: nowrap; }
  .claim-table td.center { text-align: center; }
  .claim-table tr:nth-child(even) td { background: #f5f7ff; }
  .claim-table .total-row td { background: #e8ecf8; font-weight: bold; border-top: 2px solid #1e3570; font-size: 10pt; }
  .summary-box { border: 2px solid #1e3570; padding: 10px 16px; margin: 14px 0; page-break-inside: avoid; }
  .summary-box table { border-collapse: collapse; width: 100%; font-size: 11.5pt; }
  .summary-box td { padding: 4px 8px; }
  .summary-box td:last-child { text-align: right; font-weight: bold; }
  .summary-box .grand td { border-top: 2px solid #1e3570; font-size: 13pt; font-weight: bold; padding-top: 8px; }
  .warn-box { border-left: 4px solid #c00; padding: 10px 14px; margin: 14px 0; background: #fff8f8; font-size: 11.5pt; }
  .warn-box ol { margin-left: 20px; }
  .warn-box ol li { margin-bottom: 6px; }
  .sign-block { margin-top: 36px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 230px; }
  .sign-line { border-top: 1px solid #000; margin-top: 44px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
`

const tableRows = rows.map(r => `
  <tr>
    <td class="center">${r.no}</td>
    <td class="center">${r.date}</td>
    <td>${inr(r.gross)}</td>
    <td>${inr(RECEIVED)}</td>
    <td>${inr(r.net)}</td>
    <td class="center">${r.dueDate}</td>
    <td class="center">${r.periodTo}</td>
    <td class="center">${r.days}</td>
    <td>${inr(r.interest)}</td>
  </tr>`).join('')

const DIVISIONS = [
  {
    slug: 'Dungarpur',
    letterNo: 'SBC/PWD/2026/10-D',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nDungarpur (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
  },
  {
    slug: 'Simalwara',
    letterNo: 'SBC/PWD/2026/10-S',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nSimalwara (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
  },
]

function buildHTML(div) {
return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">M/s SHRI BAJRANG CONSTRUCTION</div>
    <div class="firm-sub">"AA" Class PWD Contractor &nbsp;|&nbsp; Padli Gujreshwar, Distt. Dungarpur (Raj.)</div>
  </div>

  <table class="meta-table">
    <tr><td>Letter No.</td><td>: ${div.letterNo}</td></tr>
    <tr><td>Date</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    To,<br>
    <strong>${div.to.split('\n').join('<br>')}</strong>
    <br><br>
    CC: ${div.cc.split('\n').join('<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')}
  </div>

  <div class="subject-line">
    Subject: Reminder — Demand for Immediate Payment of Outstanding Running Bills<br>
    with Interest @ 18% p.a. — Construction of Amli Fala Bridge and Kherveda Nai Basti<br>
    to Veeri Border via Kunjiya Vali Mata Road — Contract No. AR/2023-24/1-D
  </div>

  <div class="body-text">

    <p>Reference:<br>
    1. Work Order / Contract No. AR/2023-24/1-D dated 17.07.2023<br>
    2. Our earlier payment demand letters on record</p>

    <p>Sir,</p>

    <p>With reference to the above-cited contract, we hereby submit this formal
    <strong>Reminder</strong> for immediate payment of all outstanding Running Bills.
    Despite our previous correspondence, the dues remain unpaid, causing severe
    financial hardship and work stoppage.</p>

    <div class="section-title">1. STATEMENT OF OUTSTANDING BILLS WITH INTEREST (as on 10.04.2026)</div>

    <p class="note">Note: Bills are cumulative — Net Due = Cumulative Gross minus Amount Received till that bill date.
    Interest is period-wise on running net outstanding from due date (bill date + 1 month) to next bill's due date;
    last bill runs to letter date 10.04.2026. Rate: 18% p.a. | Formula: Net Due × 18% ÷ 365 × Days</p>

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

    <div class="section-title">2. SUMMARY OF TOTAL AMOUNT CLAIMED</div>

    <div class="summary-box">
      <table>
        <tr>
          <td>(A) Net Outstanding Principal — Bill 4 (${inr(BILLS[3].gross)} − ${inr(RECEIVED)})</td>
          <td>${inr(latestNet)}</td>
        </tr>
        <tr>
          <td>(B) Total Interest Accrued @ 18% p.a. (period-wise on running net)</td>
          <td>${inr(totalInterest)}</td>
        </tr>
        <tr class="grand">
          <td>GRAND TOTAL CLAIMED (A + B)</td>
          <td>${inr(grandTotal)}</td>
        </tr>
      </table>
    </div>

    <p><strong>Grand Total in Words:</strong> Rupees ${grandTotal.toLocaleString('en-IN')} Only
    (${inr(grandTotal)}/-)</p>

    <div class="section-title">3. FORMAL DEMAND</div>

    <p>We hereby formally demand payment of the Grand Total of <strong>${inr(grandTotal)}</strong>
    within <strong>FIFTEEN (15) DAYS</strong> from the date of this letter,
    i.e., on or before <strong>25.04.2026</strong>.</p>

    <div class="warn-box">
      <p><strong>Consequences of Non-Compliance (if dues not cleared by 25.04.2026):</strong></p>
      <ol>
        <li>Initiation of <strong>Arbitration proceedings</strong> under the
        Arbitration &amp; Conciliation Act, 1996.</li>
        <li>Complaint to the <strong>Vigilance Department / Anti-Corruption Bureau</strong>
        against the concerned officers for willful non-payment and dereliction of duty.</li>
        <li>Filing of <strong>RTI Application</strong> to ascertain reasons for deliberate delay.</li>
        <li><strong>Suspension of work</strong> at site under the contract terms.</li>
        <li>Claim for <strong>additional consequential damages</strong> under
        Section 73, Indian Contract Act, 1872.</li>
      </ol>
    </div>

    <p>We trust you will treat this matter with the urgency it deserves and arrange
    immediate release of all pending dues.</p>

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

</body></html>`
}

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
  console.log('✓', outPath)
}

console.log('\nGenerating payment reminder PDFs (2 divisions)...\n')
for (const div of DIVISIONS) {
  await makePDF(buildHTML(div), `Letter_PaymentReminder_EE_${div.slug}_10Apr2026.pdf`)
}
console.log('\nDone.')
