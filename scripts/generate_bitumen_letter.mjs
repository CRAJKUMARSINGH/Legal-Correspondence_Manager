/**
 * PDF Generator — Bitumen Work (PMC & Seal Coat) Pending Letter
 * To: EE PWD Division Dungarpur AND EE PWD Division Sagwara
 * Contract: AR/2023-24/1-D
 * Date: 10.04.2026
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '05_Bill_Submission_Payment_Demand')

const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    color: #000;
    line-height: 1.75;
    width: 100%;
  }
  .header-bar {
    border-top: 3px solid #1e3570;
    border-bottom: 1px solid #1e3570;
    padding: 8px 0;
    margin-bottom: 16px;
  }
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; letter-spacing: 0.5px; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 2px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 12px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 130px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 14px; line-height: 1.9; }
  .subject-line {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 14px 0 16px 0;
    line-height: 1.6;
  }
  .body-text { font-size: 11.5pt; line-height: 1.8; text-align: justify; }
  .body-text p { margin-bottom: 11px; }
  .body-text ol { margin: 8px 0 12px 24px; }
  .body-text ol li { margin-bottom: 7px; }
  .info-box {
    border: 1.5px solid #1e3570;
    padding: 10px 16px;
    margin: 12px 0;
    background: #f7f9ff;
    font-size: 11.5pt;
  }
  .info-box table { border-collapse: collapse; width: 100%; }
  .info-box td { padding: 4px 8px; vertical-align: top; }
  .info-box td:first-child { width: 55%; font-weight: normal; }
  .info-box td:last-child { font-weight: bold; }
  .info-box .total-row td {
    border-top: 2px solid #1e3570;
    font-weight: bold;
    font-size: 12pt;
    padding-top: 7px;
  }
  .warn-box {
    border-left: 4px solid #c00;
    padding: 10px 14px;
    margin: 14px 0;
    background: #fff8f8;
    font-size: 11.5pt;
  }
  .warn-box ol { margin-left: 20px; }
  .warn-box ol li { margin-bottom: 6px; }
  .sign-block { margin-top: 36px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 230px; }
  .sign-line { border-top: 1px solid #000; margin-top: 44px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
  .placeholder { background: #fffbe6; border-bottom: 1.5px solid #c80; padding: 0 4px; font-style: italic; }
`

const DIVISIONS = [
  {
    slug: 'Dungarpur',
    letterNo: 'SBC/PWD/2026/09-D',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nDungarpur (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
  },
  {
    slug: 'Simalwara',
    letterNo: 'SBC/PWD/2026/09-S',
    to: 'The Executive Engineer,\nPublic Works Department Division,\nSimalwara (Raj.)',
    cc: '1. Superintending Engineer, PWD Circle Banswada\n2. Additional Chief Engineer, PWD Circle Banswada',
  },
]

function toLines(str) {
  return str.split('\n').join('<br>')
}

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
    <strong>${toLines(div.to)}</strong>
    <br><br>
    CC: ${toLines(div.cc)}
  </div>

  <div class="subject-line">
    Subject: Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border<br>
    via Kunjiya Vali Mata Road — Contract No. AR/2023-24/1-D<br>
    Regarding: Pending PMC and Seal Coat Work in Chainage
    <span class="placeholder">Z1</span> to <span class="placeholder">Z2</span> —
    Exhaustion of Work Order Amount and Request for Deviation Approval
    with Provisional Time Extension
  </div>

  <div class="body-text">

    <p>Reference: Work Order / Contract No. AR/2023-24/1-D dated 17.07.2023<br>
    Work: Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border
    via Kunjiya Vali Mata Road</p>

    <p>Sir,</p>

    <p>With reference to the above-cited contract, we wish to bring the following
    important matter to your kind notice regarding the pending PMC and Seal Coat
    work in Chainage <span class="placeholder">Z1</span> to
    <span class="placeholder">Z2</span>.</p>

    <p><strong>1. Exhaustion of Work Order Amount</strong></p>

    <div class="info-box">
      <table>
        <tr><td>Original Work Order / Contract Value</td><td>₹ 3,92,24,443.00 (@ 9.05% Below)</td></tr>
        <tr><td>Date of Commencement</td><td>28.07.2023</td></tr>
        <tr><td>Stipulated Date of Completion</td><td>28.01.2024</td></tr>
        <tr><td>Total Work Executed at Site to Date<br>(including all deviations instructed till now)</td><td>₹ 4,27,95,925.00</td></tr>
        <tr class="total-row">
          <td>Excess over Work Order Amount</td>
          <td>₹ 35,71,482.00</td>
        </tr>
      </table>
    </div>

    <p><strong>2. Position Regarding Pending Bitumen Work</strong></p>

    <p>It is submitted that the work executed at site amounting to
    <strong>₹ 4,27,95,925/-</strong> already exceeds the original Work Order amount
    of <strong>₹ 3,92,24,443/-</strong> by <strong>₹ 35,71,482/-</strong>, on account
    of various deviations instructed by the Department from time to time.</p>

    <p>In this background, the PMC (Premix Carpet) and Seal Coat work in Chainage
    <span class="placeholder">Z1</span> to <span class="placeholder">Z2</span>
    remains pending for execution. However, in order to honour the financial discipline
    of the Agreement and to protect the contractual rights of our firm, <strong>we are
    not in a position to execute the said bitumen work (PMC and Seal Coat) in the
    indicated chainages without a pre-approved deviation covering the excess amount
    already executed as well as the cost of the pending bitumen work.</strong></p>

    <p><strong>3. Request for Deviation Approval and Provisional Time Extension</strong></p>

    <p>In view of the above, we hereby request your goodself to:</p>

    <ol>
      <li>Kindly get the <strong>Deviation Statement</strong> — covering the excess work
      of ₹ 35,71,482/- already executed beyond the Work Order amount, as well as the
      cost of the pending PMC and Seal Coat work in Chainage
      <span class="placeholder">Z1</span> to <span class="placeholder">Z2</span> —
      <strong>approved through the Competent Authority within one month</strong>
      from the date of this letter, i.e., on or before <strong>10.05.2026</strong>.</li>

      <li>Simultaneously, kindly also grant a <strong>Provisional Time Extension</strong>
      for an appropriate period to cover the delay caused by departmental reasons
      (pending deviation approval, non-payment of running bills, forest clearance
      delays, and irrigation department NOC), so that our firm is not penalised for
      delays not attributable to us.</li>
    </ol>

    <div class="warn-box">
      <p><strong>Important Notice:</strong></p>
      <p>If the pre-approved Deviation Statement (as requested above) is not communicated
      to us within <strong>one month (by 10.05.2026)</strong>, we shall not be bound to
      execute the pending PMC and Seal Coat work in Chainage
      <span class="placeholder">Z1</span> to <span class="placeholder">Z2</span>,
      as executing the same without deviation approval would be in violation of the
      financial discipline of the Agreement and would expose our firm to undue financial
      risk without contractual protection.</p>
      <p style="margin-top:8px">This letter is being issued to place our position clearly
      on record and to protect our contractual rights. We remain ready and willing to
      execute the said bitumen work immediately upon receipt of the pre-approved
      Deviation Statement and Provisional Time Extension.</p>
    </div>

    <p>Kindly treat this matter as urgent and acknowledge receipt of this letter.</p>

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

console.log('\nGenerating Bitumen Work letters (2 divisions)...\n')
for (const div of DIVISIONS) {
  await makePDF(buildHTML(div), `Letter_BitumenWork_PMC_SealCoat_${div.slug}_10Apr2026.pdf`)
}
console.log('\nDone. Fill in Z1 and Z2 chainage values before dispatch.')
