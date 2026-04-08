/**
 * PDF Generator — 04_Work_Withdrawal_Objection
 * STRONG REMINDER — To ACE Banswada
 * CC: SE Baneshwar Dham, EE Baneshwar Dham
 * Date: 10.04.2026
 *
 * Key facts:
 *   - Work withdrawal proposed despite ALL delays being departmental
 *   - EE has NEVER responded to any bill reminder (letters 237, 337, JJ32)
 *   - No payment since work resumed
 *   - Bills pending since Feb 2025 — over 13 months
 *   - Dept was swift to threaten withdrawal but silent on ₹2.77 Cr dues
 *   - ATR (Action Taken Report) demanded by dept before bill processing — contractor
 *     forced to run window-to-window for ATR inclusion by EE quality control
 *   - This is a serious breach of contract obligations
 */

import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '04_Work_Withdrawal_Objection')

const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Times New Roman', 'Noto Serif', serif;
    font-size: 12pt;
    color: #000;
    line-height: 1.8;
    width: 100%;
  }
  .header-bar {
    border-top: 3px solid #1e3570;
    border-bottom: 1px solid #1e3570;
    padding: 8px 0;
    margin-bottom: 16px;
  }
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; letter-spacing: 0.5px; font-family: 'Times New Roman', serif; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 2px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 14px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 150px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 6px; line-height: 1.9; }
  .cc-block { font-size: 11pt; margin-bottom: 14px; line-height: 1.8; color: #222; }
  .subject-line {
    text-align: center;
    font-size: 12pt;
    font-weight: bold;
    text-decoration: underline;
    margin: 14px 0 16px 0;
    line-height: 1.6;
  }
  .body-text { font-size: 11.5pt; line-height: 1.9; text-align: justify; }
  .body-text p { margin-bottom: 12px; }
  .body-text ol { margin: 8px 0 12px 28px; }
  .body-text ol li { margin-bottom: 8px; }
  .body-text ul { margin: 8px 0 12px 28px; list-style: disc; }
  .body-text ul li { margin-bottom: 6px; }

  /* Interest table */
  .int-table { border-collapse: collapse; width: 100%; font-size: 9.5pt; margin: 12px 0; }
  .int-table th {
    background: #1e3570; color: #fff; padding: 5px 6px;
    border: 1px solid #1e3570; text-align: center; font-size: 9pt;
  }
  .int-table td { border: 1px solid #999; padding: 4px 6px; text-align: center; }
  .int-table td.left { text-align: left; }
  .int-table tr.total-row td {
    background: #1e3570; color: #fff; font-weight: bold;
    font-size: 10pt; border: 1px solid #1e3570;
  }

  /* Summary box */
  .summary-box {
    border: 2px solid #1e3570;
    padding: 12px 18px;
    margin: 14px 0;
    background: #f7f9ff;
    font-size: 11.5pt;
  }
  .summary-box table { border-collapse: collapse; width: 100%; }
  .summary-box td { padding: 4px 8px; }
  .summary-box td:last-child { text-align: right; font-weight: bold; }
  .summary-box .grand-row td {
    border-top: 2px solid #1e3570;
    font-weight: bold;
    font-size: 13pt;
    padding-top: 8px;
    color: #1e3570;
  }

  /* Warning box */
  .warn-box {
    border-left: 5px solid #c00;
    padding: 12px 16px;
    margin: 16px 0;
    background: #fff5f5;
    font-size: 11.5pt;
  }
  .warn-box p { margin-bottom: 8px; }
  .warn-box ol { margin-left: 22px; }
  .warn-box ol li { margin-bottom: 7px; }

  /* Contrast callout */
  .callout {
    border: 1.5px solid #c00;
    padding: 10px 16px;
    margin: 14px 0;
    background: #fff8f8;
    font-size: 11.5pt;
    font-style: italic;
  }

  .sign-block { margin-top: 40px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 240px; }
  .sign-line { border-top: 1px solid #000; margin-top: 48px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
  .underline { text-decoration: underline; }
  .bold { font-weight: bold; }
  .red { color: #c00; }
`

const letter = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">M/s SHRI BAJRANG CONSTRUCTION</div>
    <div class="firm-sub">"AA" Class PWD Contractor &nbsp;|&nbsp; Padli Gujreshwar, Distt. Dungarpur (Raj.)</div>
  </div>

  <table class="meta-table">
    <tr><td>Letter No.</td><td>: SBC/PWD/2026/10</td></tr>
    <tr><td>Date</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    To,<br>
    <span class="bold">The Additional Chief Engineer,</span><br>
    Public Works Department, Circle Banswada,<br>
    Banswada (Raj.)
  </div>

  <div class="cc-block">
    <span class="bold">CC:</span><br>
    1. The Superintending Engineer, PWD Baneshwar Dham<br>
    2. The Executive Engineer, PWD Division Baneshwar Dham
  </div>

  <div class="subject-line">
    SUBJECT: STRONG REMINDER — Urgent Reply Demanded on Objection to Work Withdrawal Proposal<br>
    AND Immediate Release of Running Bills Pending Since February 2025 (₹ 2,77,82,436/- + Interest)<br>
    <span style="font-size:11pt;">(Ref: Our Letter No. JJ 32 dt. 20.11.2025 | Your Office Letter No. D-502 dt. 19.11.2025 |<br>
    Contract No. AR/2023-24/1-D)</span>
  </div>

  <div class="body-text">

    <p>Sir,</p>

    <p>We write with deep concern and a sense of grave injustice to bring to your urgent attention the
    <span class="bold underline">complete and deliberate inaction</span> of this Department — particularly the Executive Engineer,
    PWD Division Baneshwar Dham — in the matter of our pending running bills and our objection to the
    unjust work withdrawal proposal.</p>

    <p><span class="bold">1. BACKGROUND — OBJECTION TO WORK WITHDRAWAL (Letter No. JJ 32 dt. 20.11.2025)</span></p>

    <p>In response to your office letter No. D-502 dated 19.11.2025 proposing withdrawal of the work for
    <em>Strengthening and Widening of BT Road from Punjpur Kanthadi, Khermal Km 0/0 to 12/0</em>,
    we filed a detailed objection vide our letter No. JJ 32 dated 20.11.2025, clearly establishing that
    <span class="bold">all delays are entirely attributable to departmental failures</span>:</p>

    <ol>
      <li><span class="bold">Forest Clearance (Stage I &amp; II):</span> Not mentioned in tender documents.
      Received for the first time on 13.11.2025 — a full <span class="bold">18 months after the contract
      completion date</span>. The contractor cannot be penalised for a hindrance the Department itself
      created and concealed.</li>

      <li><span class="bold">Irrigation Department NOC for CD Work (~₹ 1.00 Crore):</span> Permission
      still not obtained by the Department to this date. Work at this reach remains physically impossible.</li>

      <li><span class="bold">Running Bills Pending Since July 2024:</span> Approx. ₹ 2.50 Crore in dues
      were outstanding at the time of our objection. The Department expected us to mobilise resources and
      execute work while withholding our own earned money.</li>
    </ol>

    <div class="callout">
      It is deeply troubling that this Department moved with remarkable speed and efficiency to issue a
      work withdrawal notice (Letter D-502 within days of the forest clearance being received), yet has
      shown <span class="bold">zero urgency</span> in responding to our objection letter filed over
      <span class="bold">4 months ago</span>, or in releasing a single rupee of our dues.
    </div>

    <p><span class="bold">2. NO PAYMENT SINCE WORK RESUMED — BILLS PENDING OVER 13 MONTHS</span></p>

    <p>Despite resuming work in good faith and continuing to execute the contract, <span class="bold red">not
    a single payment has been made by the Department since work resumed.</span> The Executive Engineer,
    PWD Division Baneshwar Dham has not responded to a single one of our bill reminders — not to
    Letter No. 237 (10.07.2025), not to Letter No. 337 (15.10.2025), not to Letter No. JJ 32
    (20.11.2025). This constitutes <span class="bold">willful default and dereliction of duty.</span></p>

    <p>The complete statement of pending running bills with interest accrued @ 18% p.a. (as per
    Section 73 &amp; 74, Indian Contract Act 1872, and PWD contract terms) is as under:</p>

    <table class="int-table">
      <thead>
        <tr>
          <th>Bill No.</th>
          <th>Bill Date</th>
          <th>Cumulative Gross (₹)</th>
          <th>Amt. Received (₹)</th>
          <th>Net Due (₹)</th>
          <th>Due Date</th>
          <th>Interest Period To</th>
          <th>Days</th>
          <th>Interest @ 18% p.a. (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>11-02-2025</td>
          <td>2,92,56,780</td>
          <td>2,05,02,520</td>
          <td>87,54,260</td>
          <td>11-03-2025</td>
          <td>18-11-2025</td>
          <td>252</td>
          <td>10,88,955</td>
        </tr>
        <tr>
          <td>2</td>
          <td>18-10-2025</td>
          <td>3,74,45,888</td>
          <td>2,05,02,520</td>
          <td>1,69,43,368</td>
          <td>18-11-2025</td>
          <td>21-01-2026</td>
          <td>64</td>
          <td>5,34,041</td>
        </tr>
        <tr>
          <td>3</td>
          <td>21-12-2025</td>
          <td>4,28,65,469</td>
          <td>2,05,02,520</td>
          <td>2,23,62,949</td>
          <td>21-01-2026</td>
          <td>18-02-2026</td>
          <td>28</td>
          <td>3,08,547</td>
        </tr>
        <tr>
          <td>4</td>
          <td>18-01-2026</td>
          <td>4,82,84,956</td>
          <td>2,05,02,520</td>
          <td>2,77,82,436</td>
          <td>18-02-2026</td>
          <td>10-04-2026</td>
          <td>51</td>
          <td>6,98,244</td>
        </tr>
        <tr class="total-row">
          <td colspan="8">TOTAL INTEREST ACCRUED (Period-wise on Running Net Outstanding)</td>
          <td>26,29,787</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-box">
      <table>
        <tr>
          <td>(A) Net Outstanding Principal (Bill 4 — latest cumulative net)</td>
          <td>₹ 2,77,82,436/-</td>
        </tr>
        <tr>
          <td>(B) Total Interest Accrued @ 18% p.a. (period-wise as above)</td>
          <td>₹    26,29,787/-</td>
        </tr>
        <tr class="grand-row">
          <td>TOTAL AMOUNT PAYABLE IMMEDIATELY (A + B)</td>
          <td>₹ 3,04,12,223/-</td>
        </tr>
      </table>
    </div>

    <p><span class="bold">3. THE ATR BURDEN — AN ADDITIONAL DEPARTMENTAL OBSTRUCTION</span></p>

    <p>To compound matters further, the Department has made bill processing contingent upon submission
    of Action Taken Reports (ATRs) verified by the Executive Engineer (Quality Control). Our contractor
    has been compelled to run from window to window — across offices and officers — merely to get ATR
    entries included, a process entirely within the Department's own administrative control. This
    procedural burden, imposed unilaterally and without contractual basis, has been used as a pretext
    to delay bill processing indefinitely. <span class="bold">This is a serious breach of the
    Department's contractual obligation to process and pay bills within 30 days of submission.</span></p>

    <p><span class="bold">4. FORMAL DEMANDS</span></p>

    <p>We hereby formally demand the following within <span class="bold underline">FIFTEEN (15) DAYS</span>
    from the date of this letter, i.e., on or before <span class="bold">25.04.2026</span>:</p>

    <ol>
      <li>A written reply confirming <span class="bold">withdrawal of the work rescission proposal</span>
      (Your Letter No. D-502 dt. 19.11.2025), with grant of time extension commensurate with
      departmental delays.</li>

      <li><span class="bold">Immediate release of ₹ 3,04,12,223/-</span> (Rupees Three Crore Four Lakh
      Twelve Thousand Two Hundred Twenty Three Only) — comprising net outstanding principal of
      ₹ 2,77,82,436/- and interest of ₹ 26,29,787/- @ 18% p.a.</li>

      <li>Directions to the Executive Engineer to <span class="bold">process all pending bills without
      further ATR-related obstruction</span> and to respond to contractor correspondence within
      stipulated timelines.</li>

      <li>Expediting the <span class="bold">Irrigation Department NOC</span> for the CD work so that
      the remaining reach can be executed without further hindrance.</li>
    </ol>

    <div class="warn-box">
      <p><span class="bold red">NOTICE OF CONSEQUENCES — If dues are not cleared and reply not received
      within 15 days:</span></p>
      <ol>
        <li><span class="bold">Arbitration:</span> Invocation of the arbitration clause under the
        Arbitration &amp; Conciliation Act, 1996, and initiation of formal arbitration proceedings
        for recovery of all dues, interest, and consequential damages.</li>

        <li><span class="bold">Vigilance / ACB Complaint:</span> Formal complaint against the Executive
        Engineer and concerned officers for willful non-payment, deliberate obstruction of bill
        processing, and dereliction of duty.</li>

        <li><span class="bold">RTI Application:</span> Filing of RTI application to place on record
        the reasons for deliberate delay in payment and the identity of officers responsible.</li>

        <li><span class="bold">Work Suspension:</span> Suspension of all work at site under contract
        terms until dues are fully cleared — with formal notice to the Department that any resulting
        delay shall be the Department's sole responsibility.</li>

        <li><span class="bold">Additional Damages:</span> Claim for consequential losses, idle
        machinery costs, labour costs, and financial charges under Section 73, Indian Contract
        Act 1872.</li>

        <li><span class="bold">Escalation to Chief Engineer / Secretary, PWD Rajasthan</span> and
        the Hon'ble Minister, PWD, with full documentary evidence of departmental misconduct.</li>
      </ol>
    </div>

    <p>We have acted in good faith throughout — resuming work despite non-payment, filing objections
    through proper channels, and waiting patiently for over four months for a reply that has never come.
    That patience is now exhausted.</p>

    <p>We trust this communication will be treated with the seriousness and urgency it demands.</p>

    <p>Yours faithfully,</p>

  </div>

  <div class="sign-block clearfix">
    <div class="sign-right">
      <div class="sign-line">
        (Manohar Patel)<br>
        Proprietor / Authorized Signatory<br>
        M/s Shri Bajrang Construction<br>
        "AA" Class PWD Contractor
      </div>
    </div>
  </div>

  <div style="margin-top: 80px; font-size: 10.5pt; color: #333;">
    <strong>Enclosures:</strong><br>
    1. Copy of Letter No. JJ 32 dated 20.11.2025 (Objection to Work Withdrawal)<br>
    2. Copies of Running Bills 1–4 (as tabulated above)<br>
    3. Copies of previous correspondence: Letter No. 237 (10.07.2025), 337 (15.10.2025), JJ 32 (20.11.2025)<br>
    4. Copy of Work Order / Agreement No. AR/2023-24/1-D dated 17.07.2023
  </div>

</body></html>`

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

// ── Hindi Letter ──────────────────────────────────────────────────────────────
const letterHindi = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  ${CSS.replace("font-family: 'Times New Roman', 'Noto Serif', serif;", "font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif;")}
</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/10</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <span class="bold">श्रीमान् अतिरिक्त मुख्य अभियन्ता,</span><br>
    लोक निर्माण विभाग, संभाग द्वितीय,<br>
    बांसवाड़ा (राज.)
  </div>

  <div class="cc-block">
    <span class="bold">प्रतिलिपि:</span><br>
    1. अधीक्षण अभियन्ता, लो.नि.वि. बेणेश्वरधाम<br>
    2. अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम
  </div>

  <div class="subject-line">
    विषय: कड़ा स्मरण पत्र — कार्य वापसी के प्रस्ताव पर तत्काल उत्तर एवं फरवरी 2025 से<br>
    लंबित रनिंग बिल राशि ₹ 2,77,82,436/- + ब्याज की तत्काल अदायगी की माँग<br>
    <span style="font-size:11pt;">(संदर्भ: हमारा पत्र क्रमांक JJ 32 दि. 20.11.2025 | आपका पत्र क्रमांक डी०-502 दि. 19.11.2025 |
    अनुबंध क्रमांक AR/2023-24/1-D)</span>
  </div>

  <div class="body-text">

    <p>महोदय,</p>

    <p>हम अत्यंत खेद एवं गहरी पीड़ा के साथ आपके संज्ञान में लाना चाहते हैं कि इस विभाग द्वारा — विशेषतः
    अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम द्वारा — हमारे लंबित रनिंग बिलों एवं अन्यायपूर्ण
    कार्य वापसी के प्रस्ताव के विरुद्ध हमारी आपत्ति के संबंध में
    <span class="bold underline">पूर्ण एवं जानबूझकर की गई निष्क्रियता</span> बरती जा रही है।</p>

    <p><span class="bold">1. पृष्ठभूमि — कार्य वापसी के विरुद्ध आपत्ति (पत्र क्रमांक JJ 32 दि. 20.11.2025)</span></p>

    <p>आपके कार्यालय के पत्र क्रमांक डी०-502 दिनांक 19.11.2025 में <em>Strengthening and Widening of BT Road
    from Punjpur Kanthadi, Khermal Km 0/0 to 12/0</em> कार्य वापस लेने के प्रस्ताव के जवाब में हमने
    दिनांक 20.11.2025 को पत्र क्रमांक JJ 32 के माध्यम से विस्तृत आपत्ति प्रस्तुत की थी, जिसमें
    <span class="bold">यह स्पष्ट रूप से प्रमाणित किया गया था कि समस्त विलंब पूर्णतः विभागीय कारणों से हुए हैं:</span></p>

    <ol>
      <li><span class="bold">वन भूमि क्लीयरेंस (स्टेज-1 एवं स्टेज-2):</span> निविदा दस्तावेज़ में इसका
      कोई उल्लेख नहीं था। यह एन.ओ.सी. हमें <span class="bold">पहली बार दिनांक 13.11.2025 को प्राप्त हुई</span>
      — अनुबंध की निर्धारित समाप्ति तिथि के पूरे 18 माह बाद। ठेकेदार को उस बाधा के लिए दंडित नहीं किया
      जा सकता जो विभाग ने स्वयं उत्पन्न की और छुपाई।</li>

      <li><span class="bold">सिंचाई विभाग से सी.डी. कार्य की अनुमति (लगभग ₹ 1.00 करोड़):</span>
      आज दिनांक तक यह अनुमति विभाग द्वारा प्राप्त नहीं की गई है। इस रीच पर कार्य भौतिक रूप से असंभव है।</li>

      <li><span class="bold">जुलाई 2024 से लंबित रनिंग बिल:</span> आपत्ति के समय लगभग ₹ 2.50 करोड़ की
      देय राशि बकाया थी। विभाग हमसे अपेक्षा करता था कि हम अपनी अर्जित राशि रोककर भी कार्य जारी रखें।</li>
    </ol>

    <div class="callout">
      यह अत्यंत दुखद है कि इस विभाग ने वन क्लीयरेंस प्राप्त होते ही कार्य वापसी का नोटिस (पत्र डी०-502)
      जारी करने में असाधारण तत्परता दिखाई, परंतु हमारी आपत्ति — जो <span class="bold">4 माह से अधिक समय पूर्व</span>
      दाखिल की गई थी — का उत्तर देने में अथवा हमारी एक रुपये की देय राशि जारी करने में
      <span class="bold">शून्य रुचि</span> दिखाई है।
    </div>

    <p><span class="bold">2. कार्य पुनः प्रारंभ के बाद से कोई भुगतान नहीं — 13 माह से बिल लंबित</span></p>

    <p>सद्भावना के साथ कार्य पुनः प्रारंभ करने एवं अनुबंध का निष्पादन जारी रखने के बावजूद,
    <span class="bold red">कार्य पुनः प्रारंभ होने के बाद से विभाग द्वारा एक भी भुगतान नहीं किया गया है।</span>
    अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम ने हमारे किसी भी बिल स्मरण पत्र का उत्तर नहीं दिया —
    न पत्र क्रमांक 237 (10.07.2025) का, न पत्र क्रमांक 337 (15.10.2025) का, न पत्र क्रमांक JJ 32
    (20.11.2025) का। यह <span class="bold">जानबूझकर की गई चूक एवं कर्तव्य का घोर उल्लंघन है।</span></p>

    <p>18% वार्षिक ब्याज सहित (भारतीय संविदा अधिनियम 1872 की धारा 73 एवं 74 तथा पी.डब्ल्यू.डी. अनुबंध
    शर्तों के अनुसार) लंबित रनिंग बिलों का पूर्ण विवरण निम्नानुसार है:</p>

    <table class="int-table">
      <thead>
        <tr>
          <th>बिल क्र.</th>
          <th>बिल दिनांक</th>
          <th>संचयी सकल राशि (₹)</th>
          <th>प्राप्त राशि (₹)</th>
          <th>शुद्ध देय (₹)</th>
          <th>देय तिथि</th>
          <th>ब्याज अवधि तक</th>
          <th>दिन</th>
          <th>ब्याज @ 18% प्रति वर्ष (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>11-02-2025</td>
          <td>2,92,56,780</td>
          <td>2,05,02,520</td>
          <td>87,54,260</td>
          <td>11-03-2025</td>
          <td>18-11-2025</td>
          <td>252</td>
          <td>10,88,955</td>
        </tr>
        <tr>
          <td>2</td>
          <td>18-10-2025</td>
          <td>3,74,45,888</td>
          <td>2,05,02,520</td>
          <td>1,69,43,368</td>
          <td>18-11-2025</td>
          <td>21-01-2026</td>
          <td>64</td>
          <td>5,34,041</td>
        </tr>
        <tr>
          <td>3</td>
          <td>21-12-2025</td>
          <td>4,28,65,469</td>
          <td>2,05,02,520</td>
          <td>2,23,62,949</td>
          <td>21-01-2026</td>
          <td>18-02-2026</td>
          <td>28</td>
          <td>3,08,547</td>
        </tr>
        <tr>
          <td>4</td>
          <td>18-01-2026</td>
          <td>4,82,84,956</td>
          <td>2,05,02,520</td>
          <td>2,77,82,436</td>
          <td>18-02-2026</td>
          <td>10-04-2026</td>
          <td>51</td>
          <td>6,98,244</td>
        </tr>
        <tr class="total-row">
          <td colspan="8">कुल ब्याज (चालू शुद्ध बकाया पर अवधि-वार)</td>
          <td>26,29,787</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-box">
      <table>
        <tr>
          <td>(अ) शुद्ध बकाया मूलधन (बिल 4 — नवीनतम संचयी शुद्ध)</td>
          <td>₹ 2,77,82,436/-</td>
        </tr>
        <tr>
          <td>(ब) कुल अर्जित ब्याज @ 18% प्रति वर्ष (अवधि-वार उपरोक्तानुसार)</td>
          <td>₹    26,29,787/-</td>
        </tr>
        <tr class="grand-row">
          <td>तत्काल देय कुल राशि (अ + ब)</td>
          <td>₹ 3,04,12,223/-</td>
        </tr>
      </table>
    </div>

    <p><span class="bold">3. ए.टी.आर. की बाधा — एक अतिरिक्त विभागीय अवरोध</span></p>

    <p>इससे भी अधिक, विभाग ने बिल प्रसंस्करण को कार्यवाही रिपोर्ट (Action Taken Report — ATR) की
    शर्त से जोड़ दिया है, जिसे अधिशासी अभियन्ता (गुणवत्ता नियंत्रण) द्वारा सत्यापित किया जाना आवश्यक है।
    हमारे ठेकेदार को केवल ए.टी.आर. प्रविष्टि करवाने के लिए कार्यालय से कार्यालय, खिड़की से खिड़की
    दौड़ना पड़ रहा है — जबकि यह प्रक्रिया पूर्णतः विभाग के अपने प्रशासनिक नियंत्रण में है।
    यह शर्त अनुबंध में कहीं उल्लिखित नहीं है और इसे बिल भुगतान में अनिश्चितकालीन विलंब के बहाने के
    रूप में उपयोग किया जा रहा है। <span class="bold">यह बिल प्रस्तुति के 30 दिन के भीतर भुगतान करने
    की विभाग की संविदात्मक बाध्यता का गंभीर उल्लंघन है।</span></p>

    <p><span class="bold">4. औपचारिक माँगें</span></p>

    <p>हम इस पत्र की तिथि से <span class="bold underline">पंद्रह (15) दिवस के भीतर</span>, अर्थात्
    <span class="bold">25.04.2026 तक</span>, निम्नलिखित कार्यवाही की औपचारिक माँग करते हैं:</p>

    <ol>
      <li>कार्य वापसी के प्रस्ताव (आपका पत्र क्रमांक डी०-502 दि. 19.11.2025) को
      <span class="bold">वापस लेने की लिखित पुष्टि</span> एवं विभागीय विलंब के अनुपात में
      उचित समय-विस्तार की स्वीकृति।</li>

      <li><span class="bold">₹ 3,04,12,223/- (रुपये तीन करोड़ चार लाख बारह हजार दो सौ तेईस मात्र)
      का तत्काल भुगतान</span> — जिसमें शुद्ध बकाया मूलधन ₹ 2,77,82,436/- एवं 18% वार्षिक ब्याज
      ₹ 26,29,787/- सम्मिलित है।</li>

      <li>अधिशासी अभियन्ता को निर्देश कि <span class="bold">ए.टी.आर. संबंधी अवरोध के बिना समस्त
      लंबित बिलों का प्रसंस्करण</span> किया जाए एवं ठेकेदार के पत्राचार का निर्धारित समय में
      उत्तर दिया जाए।</li>

      <li>सिंचाई विभाग से सी.डी. कार्य की <span class="bold">एन.ओ.सी. शीघ्र दिलवाई जाए</span>
      ताकि शेष रीच पर कार्य बिना बाधा के पूर्ण किया जा सके।</li>
    </ol>

    <div class="warn-box">
      <p><span class="bold red">चेतावनी — यदि 15 दिवस में देय राशि जारी नहीं हुई एवं उत्तर प्राप्त
      नहीं हुआ:</span></p>
      <ol>
        <li><span class="bold">मध्यस्थता:</span> मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत
        मध्यस्थता खंड का आह्वान एवं समस्त देय राशि, ब्याज एवं परिणामी क्षतिपूर्ति की वसूली हेतु
        औपचारिक मध्यस्थता कार्यवाही।</li>

        <li><span class="bold">सतर्कता / भ्रष्टाचार निरोधक ब्यूरो में शिकायत:</span> अधिशासी
        अभियन्ता एवं संबंधित अधिकारियों के विरुद्ध जानबूझकर भुगतान न करने, बिल प्रसंस्करण में
        जानबूझकर बाधा डालने एवं कर्तव्य-विमुखता के लिए औपचारिक शिकायत।</li>

        <li><span class="bold">आर.टी.आई. आवेदन:</span> भुगतान में जानबूझकर विलंब के कारणों एवं
        जिम्मेदार अधिकारियों की पहचान हेतु सूचना का अधिकार अधिनियम के तहत आवेदन।</li>

        <li><span class="bold">कार्य स्थगन:</span> अनुबंध शर्तों के अंतर्गत कार्यस्थल पर समस्त
        कार्य का स्थगन — विभाग को औपचारिक सूचना के साथ कि इससे उत्पन्न किसी भी विलंब की
        जिम्मेदारी पूर्णतः विभाग की होगी।</li>

        <li><span class="bold">अतिरिक्त क्षतिपूर्ति:</span> भारतीय संविदा अधिनियम 1872 की धारा 73
        के अंतर्गत परिणामी हानि, निष्क्रिय मशीनरी लागत, श्रम लागत एवं वित्तीय प्रभार का दावा।</li>

        <li><span class="bold">मुख्य अभियन्ता / सचिव, लो.नि.वि. राजस्थान</span> एवं माननीय
        मंत्री, लो.नि.वि. को विभागीय कदाचार के पूर्ण दस्तावेजी साक्ष्य सहित उच्चस्तरीय शिकायत।</li>
      </ol>
    </div>

    <p>हमने पूरे समय सद्भावना के साथ कार्य किया है — बिना भुगतान के भी कार्य पुनः प्रारंभ किया,
    उचित माध्यम से आपत्तियाँ दर्ज कीं, और चार माह से अधिक समय तक उस उत्तर की प्रतीक्षा की जो
    कभी नहीं आया। अब वह धैर्य समाप्त हो चुका है।</p>

    <p>हमें विश्वास है कि आप इस पत्र को उस गंभीरता एवं तत्परता के साथ लेंगे जिसकी यह माँग करता है।</p>

    <p>भवदीय,</p>

  </div>

  <div class="sign-block clearfix">
    <div class="sign-right">
      <div class="sign-line">
        (मनोहर पटेल)<br>
        स्वामी / प्राधिकृत हस्ताक्षरकर्ता<br>
        मेसर्स श्री बजरंग कंस्ट्रक्शन<br>
        "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार
      </div>
    </div>
  </div>

  <div style="margin-top: 80px; font-size: 10.5pt; color: #333;">
    <strong>संलग्नक:</strong><br>
    1. पत्र क्रमांक JJ 32 दिनांक 20.11.2025 की प्रति (कार्य वापसी के विरुद्ध आपत्ति)<br>
    2. रनिंग बिल 1–4 की प्रतियाँ (उपरोक्त तालिकानुसार)<br>
    3. पूर्व पत्राचार की प्रतियाँ: पत्र क्रमांक 237 (10.07.2025), 337 (15.10.2025), JJ 32 (20.11.2025)<br>
    4. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023 की प्रति
  </div>

</body></html>`

// ── Generate ──────────────────────────────────────────────────────────────────
console.log('\nGenerating Strong Reminder — Work Withdrawal + Bills (English + Hindi)...\n')
await makePDF(letter,      'StrongReminder_EN_ACE_Banswada_WorkWithdrawal_Bills_10Apr2026.pdf')
await makePDF(letterHindi, 'StrongReminder_HI_ACE_Banswada_WorkWithdrawal_Bills_10Apr2026.pdf')
console.log('\nDone.')
