/**
 * CD Work Sanction Reminder
 * To: EE PWD Baneshwar Dham | CC: SE, ACE
 * Both English + Hindi PDFs
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
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.8; }
  .header-bar { border-top: 3px solid #1e3570; border-bottom: 1px solid #1e3570; padding: 8px 0; margin-bottom: 16px; text-align: center; }
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; letter-spacing: 1px; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 3px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 12px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 130px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 14px; line-height: 1.9; }
  .subject-line { text-align: center; font-size: 12pt; font-weight: bold; text-decoration: underline; margin: 14px 0 16px 0; line-height: 1.6; }
  .body-text { font-size: 11.5pt; line-height: 1.8; text-align: justify; }
  .body-text p { margin-bottom: 11px; }
  .body-text ol { margin: 8px 0 12px 24px; }
  .body-text ol li { margin-bottom: 7px; }
  .info-box { border: 1.5px solid #1e3570; padding: 10px 16px; margin: 12px 0; background: #f7f9ff; font-size: 11.5pt; }
  .info-box table { border-collapse: collapse; width: 100%; }
  .info-box td { padding: 4px 8px; vertical-align: top; }
  .info-box td:first-child { width: 60%; }
  .info-box td:last-child { font-weight: bold; }
  .info-box .total-row td { border-top: 2px solid #1e3570; font-weight: bold; padding-top: 7px; }
  .warn-box { border-left: 4px solid #c00; padding: 10px 14px; margin: 14px 0; background: #fff8f8; font-size: 11.5pt; }
  .warn-box ol { margin-left: 20px; }
  .warn-box ol li { margin-bottom: 6px; }
  .sign-block { margin-top: 36px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 230px; }
  .sign-line { border-top: 1px solid #000; margin-top: 44px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
`

const CSS_HI = CSS.replace("font-family: 'Times New Roman', Times, serif;",
  "font-family: 'Noto Sans Devanagari', Arial, sans-serif;")

const GFONT = `<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">`

// ── ENGLISH ───────────────────────────────────────────────────────────────────
const englishHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>${CSS}</style></head><body>

  <div class="header-bar">
    <div class="firm-name">M/s SHRI BAJRANG CONSTRUCTION</div>
    <div class="firm-sub">"AA" Class PWD Contractor &nbsp;|&nbsp; Padli Gujreshwar, Distt. Dungarpur (Raj.)</div>
  </div>

  <table class="meta-table">
    <tr><td>Letter No.</td><td>: SBC/PWD/2026/11</td></tr>
    <tr><td>Date</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    To,<br>
    <strong>The Executive Engineer,</strong><br>
    Public Works Department Division,<br>
    Baneshwar Dham (Raj.)
    <br><br>
    CC: 1. Superintending Engineer, PWD Baneshwar Dham<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;2. Additional Chief Engineer, PWD Circle Banswada
  </div>

  <div class="subject-line">
    Subject: Reminder — Sanction for Cross Drainage (CD) Work on Irrigation Canal<br>
    from Som-Kamla Amba Irrigation Department Still Not Conveyed —<br>
    Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border<br>
    via Kunjiya Vali Mata Road — Contract No. AR/2023-24/1-D
  </div>

  <div class="body-text">

    <p>Reference:<br>
    1. Work Order / Contract No. AR/2023-24/1-D dated 17.07.2023<br>
    2. Our Letter No. JJ 32 dated 20.11.2025 (Objection to Work Withdrawal)<br>
    3. Our earlier correspondence on record</p>

    <p>Sir,</p>

    <p>With reference to the above-cited contract, we wish to bring to your urgent
    attention that the sanction / No Objection Certificate (NOC) for the major
    <strong>Cross Drainage (CD) Work on the Irrigation Canal</strong> — which is
    required to be obtained from the <strong>Som-Kamla Amba Irrigation Department</strong>
    — has not been conveyed to us till date, despite the considerable time that has
    elapsed since the commencement of the contract.</p>

    <div class="info-box">
      <table>
        <tr><td>Contract No.</td><td>AR/2023-24/1-D dated 17.07.2023</td></tr>
        <tr><td>Work</td><td>Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road</td></tr>
        <tr><td>Stipulated Completion Date</td><td>28.01.2024</td></tr>
        <tr><td>CD Work Approx. Value</td><td>~ ₹ 1,00,00,000/- (Rupees One Crore)</td></tr>
        <tr><td>Sanction Authority</td><td>Som-Kamla Amba Irrigation Department</td></tr>
        <tr class="total-row"><td>Status of Sanction / NOC</td><td>NOT RECEIVED — till date</td></tr>
      </table>
    </div>

    <p>It is pertinent to note that:</p>

    <ol>
      <li>The CD work on the irrigation canal is a <strong>critical component</strong>
      of the above contract and cannot be executed without the prior sanction / NOC
      from the Som-Kamla Amba Irrigation Department.</li>

      <li>The responsibility of obtaining this sanction / NOC from the Irrigation
      Department rests entirely with the <strong>Public Works Department</strong>,
      as the contractor cannot approach the Irrigation Department independently
      for inter-departmental approvals.</li>

      <li>The non-receipt of this sanction is a <strong>departmental hindrance</strong>
      directly attributable to PWD's failure to coordinate with the Irrigation
      Department, and constitutes a valid ground for time extension under the
      contract terms.</li>

      <li>This hindrance has been specifically cited in our letter No. JJ 32 dated
      20.11.2025 as one of the primary reasons for delay in completion of the work,
      and the same remains unresolved.</li>
    </ol>

    <p>In view of the above, we hereby formally request your goodself to:</p>

    <ol>
      <li>Take up the matter urgently with the <strong>Som-Kamla Amba Irrigation
      Department</strong> and obtain the required sanction / NOC for the CD work
      at the earliest, and communicate the same to us <strong>within 15 days</strong>
      from the date of this letter, i.e., on or before <strong>25.04.2026</strong>.</li>

      <li>Update the <strong>Hindrance Register</strong> to record this as a
      departmental hindrance from the date of commencement of the contract until
      the date of receipt of the Irrigation Department's sanction.</li>

      <li>Grant appropriate <strong>Time Extension</strong> for the period of this
      departmental hindrance, so that our firm is not penalised for delays not
      attributable to us.</li>
    </ol>

    <div class="warn-box">
      <p><strong>Important Notice:</strong></p>
      <p>If the Irrigation Department's sanction / NOC is not communicated to us
      within 15 days (by 25.04.2026), we shall not be in a position to execute
      the CD work, and the entire delay and consequential losses arising therefrom
      shall be the sole responsibility of the Department. We reserve the right to
      claim damages under Section 73 of the Indian Contract Act, 1872 for losses
      caused by this departmental hindrance.</p>
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

// ── HINDI ─────────────────────────────────────────────────────────────────────
const hindiHTML = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">${GFONT}<style>${CSS_HI}</style></head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/11-HI</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अधिशासी अभियन्ता,</strong><br>
    लोक निर्माण विभाग खण्ड,<br>
    बेणेश्वरधाम (राज.)
    <br><br>
    प्रतिलिपि: 1. अधीक्षण अभियन्ता, लो.नि.वि. बेणेश्वरधाम<br>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    2. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. वृत्त बांसवाड़ा
  </div>

  <div class="subject-line">
    विषय: स्मरण पत्र — सोम-कमला-अम्बा सिंचाई विभाग से सी.डी. कार्य की स्वीकृति<br>
    अभी तक प्राप्त न होने के संबंध में — अमली फाला पुल एवं खेरवेड़ा नई बस्ती से<br>
    वीरी बॉर्डर तक सड़क निर्माण — अनुबंध क्रमांक AR/2023-24/1-D
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. हमारा पत्र क्रमांक JJ 32 दिनांक 20.11.2025 (कार्य वापसी के विरुद्ध आपत्ति)<br>
    3. पूर्व पत्राचार</p>

    <p>महोदय,</p>

    <p>उपरोक्त अनुबंध के संदर्भ में आपके संज्ञान में लाना है कि <strong>सिंचाई नहर पर प्रमुख क्रॉस ड्रेनेज (सी.डी.) कार्य</strong> हेतु <strong>सोम-कमला-अम्बा सिंचाई विभाग</strong> से आवश्यक स्वीकृति / एन.ओ.सी. आज दिनांक तक हमें प्राप्त नहीं हुई है।</p>

    <div class="info-box">
      <table>
        <tr><td>अनुबंध क्रमांक</td><td>AR/2023-24/1-D दिनांक 17.07.2023</td></tr>
        <tr><td>कार्य</td><td>अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण</td></tr>
        <tr><td>निर्धारित पूर्णता दिनांक</td><td>28.01.2024</td></tr>
        <tr><td>सी.डी. कार्य की अनुमानित राशि</td><td>~ ₹ 1,00,00,000/- (लगभग एक करोड़)</td></tr>
        <tr><td>स्वीकृति प्राधिकारी</td><td>सोम-कमला-अम्बा सिंचाई विभाग</td></tr>
        <tr class="total-row"><td>स्वीकृति / एन.ओ.सी. की स्थिति</td><td>आज दिनांक तक प्राप्त नहीं</td></tr>
      </table>
    </div>

    <p>निम्नलिखित तथ्य विशेष रूप से उल्लेखनीय हैं:</p>

    <ol>
      <li>सिंचाई नहर पर सी.डी. कार्य इस अनुबंध का <strong>अत्यंत महत्वपूर्ण घटक</strong> है जिसे सोम-कमला-अम्बा सिंचाई विभाग की पूर्व स्वीकृति / एन.ओ.सी. के बिना निष्पादित नहीं किया जा सकता।</li>

      <li>यह अंतर-विभागीय स्वीकृति प्राप्त करने का दायित्व पूर्णतः <strong>लोक निर्माण विभाग</strong> का है। ठेकेदार स्वतंत्र रूप से सिंचाई विभाग से संपर्क नहीं कर सकता।</li>

      <li>इस स्वीकृति की अनुपलब्धता एक <strong>विभागीय हिंदरेंस</strong> है जो पी.डब्ल्यू.डी. की सिंचाई विभाग से समन्वय में विफलता के कारण उत्पन्न हुई है। यह अनुबंध की शर्तों के अंतर्गत समय विस्तार का वैध आधार है।</li>

      <li>यह हिंदरेंस हमारे पत्र क्रमांक JJ 32 दिनांक 20.11.2025 में कार्य विलंब के प्रमुख कारणों में से एक के रूप में उल्लिखित है, जो अभी तक अनसुलझी है।</li>
    </ol>

    <p>अतः आपसे निम्नलिखित कार्यवाही का विनम्र किंतु दृढ़ अनुरोध है:</p>

    <ol>
      <li><strong>सोम-कमला-अम्बा सिंचाई विभाग</strong> से सी.डी. कार्य की आवश्यक स्वीकृति / एन.ओ.सी. तत्काल प्राप्त कर इस पत्र के दिनांक से <strong>15 दिवस के भीतर</strong> अर्थात् <strong>25.04.2026</strong> तक हमें सूचित करें।</li>

      <li><strong>हिंदरेंस रजिस्टर</strong> में अनुबंध प्रारंभ दिनांक से सिंचाई विभाग की स्वीकृति प्राप्ति दिनांक तक इस विभागीय हिंदरेंस को दर्ज करें।</li>

      <li>इस विभागीय हिंदरेंस की अवधि के लिए उचित <strong>समय विस्तार</strong> प्रदान करें ताकि हमारी फर्म को हमारे कारण न होने वाले विलंब के लिए दंडित न किया जाए।</li>
    </ol>

    <div class="warn-box">
      <p><strong>महत्वपूर्ण सूचना:</strong></p>
      <p>यदि 15 दिवस (25.04.2026) तक सिंचाई विभाग की स्वीकृति / एन.ओ.सी. हमें प्राप्त नहीं होती, तो हम सी.डी. कार्य निष्पादित करने की स्थिति में नहीं होंगे। इससे उत्पन्न होने वाले समस्त विलंब एवं क्षति का दायित्व पूर्णतः विभाग का होगा। हम भारतीय संविदा अधिनियम 1872 की धारा 73 के अंतर्गत क्षतिपूर्ति का दावा करने का अधिकार सुरक्षित रखते हैं।</p>
    </div>

    <p>कृपया इस पत्र की प्राप्ति स्वीकार करें एवं इस विषय को अत्यावश्यक मानते हुए कार्यवाही करें।</p>

  </div>

  <div class="sign-block clearfix">
    <div class="sign-right">
      <div class="sign-line">
        (मनोहर पटेल)<br>
        स्वामी / प्राधिकृत हस्ताक्षरकर्ता<br>
        मेसर्स श्री बजरंग कंस्ट्रक्शन
      </div>
    </div>
  </div>

</body></html>`

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

console.log('\nGenerating CD Work Sanction Reminder PDFs...\n')
await makePDF(englishHTML, 'Letter_CDWork_IrrigationSanction_Reminder_EN_10Apr2026.pdf')
await makePDF(hindiHTML,   'Letter_CDWork_IrrigationSanction_Reminder_HI_10Apr2026.pdf')
console.log('\nDone.')
