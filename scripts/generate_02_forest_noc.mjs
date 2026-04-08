/**
 * PDF Generator — 02_Forest_Clearance_NOC
 * Letter 1133 dated 19.11.2025 — Forest Clearance NOC & Hindrance Register Update
 * + Reminder to SE if no reply within 15 days
 */

import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '02_Forest_Clearance_NOC')

const CSS = `
  @page { size: A4; margin: 20mm 20mm 20mm 25mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Noto Sans Devanagari', 'Arial Unicode MS', sans-serif;
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
  .firm-name { font-size: 14pt; font-weight: bold; color: #1e3570; letter-spacing: 0.5px; }
  .firm-sub { font-size: 10pt; color: #333; margin-top: 2px; }
  .meta-table { border-collapse: collapse; width: 100%; font-size: 11pt; margin-bottom: 14px; }
  .meta-table td { padding: 2px 6px 2px 0; vertical-align: top; }
  .meta-table td:first-child { width: 140px; font-weight: bold; white-space: nowrap; }
  .to-block { font-size: 11.5pt; margin-bottom: 14px; line-height: 1.9; }
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
  .body-text ol { margin: 8px 0 12px 24px; }
  .body-text ol li { margin-bottom: 8px; }
  .info-box {
    border: 1.5px solid #1e3570;
    padding: 10px 16px;
    margin: 12px 0;
    background: #f7f9ff;
    font-size: 11.5pt;
  }
  .sign-block { margin-top: 36px; font-size: 11.5pt; }
  .sign-right { float: right; text-align: center; width: 230px; }
  .sign-line { border-top: 1px solid #000; margin-top: 44px; padding-top: 5px; }
  .clearfix::after { content: ''; display: table; clear: both; }
`

// ── Letter 1133 — Main Letter ─────────────────────────────────────────────────
const mainLetter = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: 1133</td></tr>
    <tr><td>दिनांक</td><td>: 19.11.2025</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अधिशाषी अभियन्ता,</strong><br>
    सा० नि० वि० खण्ड,<br>
    बेणेश्वरधाम (राज.)
  </div>

  <div class="subject-line">
    विषय: फॉरेस्ट क्लीयरेंस से संबंधित एन.ओ.सी. (वन भूमि हस्तांतरण) एवं<br>
    हिंदरेंस रजिस्टर अपडेट करने बावत।
  </div>

  <div class="body-text">

    <p>संदर्भ: आपके कार्यालय पत्र क्रमांक 1844 दिनांक 13.11.2025 एवं संलग्न वन विभाग के एन.ओ.सी. पत्र।</p>

    <p>महोदय,</p>

    <p>कृपया सादर सूचित किया जाता है कि आज दिनांक 19.11.2025 को आपके कार्यालय से प्राप्त उपरोक्त संदर्भित पत्र एवं संलग्न वन विभाग के एन.ओ.सी. पत्रों के संबंध में निम्नांकित तथ्य रिकॉर्ड में लिये जाएँ:</p>

    <ol>
      <li>उक्त वन क्लीयरेंस (स्टेज-1 एवं स्टेज-2) से संबंधित कोई भी एन.ओ.सी. या कोई भी पत्र हमारे पास <strong>पहली बार आज ही</strong> दिनांक 19.11.2025 को प्राप्त हुआ है।</li>
      <li>आपके पत्र में जिस संदर्भ पत्र/कम्युनिकेशन का उल्लेख किया गया है, वह पत्र हमें <strong>कभी प्राप्त ही नहीं हुआ था</strong>। इस कारण यह हिंदरेंस हमारी ओर से नहीं, बल्कि संचार में कमी के कारण उत्पन्न हुआ था।</li>
      <li>चूँकि आज पहली बार यह एन.ओ.सी. हमारे हाथ लगी है, इसलिए इस हिंदरेंस को <strong>तत्काल प्रभाव से पूर्ण रूप से समाप्त</strong> माना जाए तथा हिंदरेंस रजिस्टर में आज की तारीख से यह बिंदु "क्लीयर" दिखाया जाए।</li>
    </ol>

    <div class="info-box">
      <strong>अनुरोध:</strong> हिंदरेंस रजिस्टर में वन भूमि हस्तांतरण (स्टेज-1 एवं स्टेज-2) से संबंधित हिंदरेंस को दिनांक <strong>19.11.2025</strong> से हटा हुआ / समाप्त दर्शाया जाए तथा इसकी लिखित पुष्टि हमें प्रेषित की जाए।
    </div>

    <p>आशा है आप इस विषय पर तत्काल कार्यवाही करते हुए हिंदरेंस रजिस्टर अपडेट करेंगे एवं पुष्टि पत्र प्रेषित करेंगे।</p>

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

// ── Reminder — if no reply within 15 days ────────────────────────────────────
const reminder = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/09</td></tr>
    <tr><td>दिनांक</td><td>: [दिनांक]</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अधीक्षण अभियन्ता,</strong><br>
    लोक निर्माण विभाग,<br>
    बेणेश्वरधाम (राज.)
  </div>

  <div class="subject-line">
    विषय: स्मरण पत्र — हिंदरेंस रजिस्टर से वन भूमि हस्तांतरण हिंदरेंस हटाने की<br>
    पुष्टि प्राप्त न होने के संबंध में<br>
    (संदर्भ: हमारा पत्र क्रमांक 1133 दिनांक 19.11.2025)
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. हमारा पत्र क्रमांक 1133 दिनांक 19.11.2025 (अधिशासी अभियन्ता, बेणेश्वरधाम को)</p>

    <p>महोदय,</p>

    <p>उपरोक्त संदर्भित पत्र के क्रम में सादर निवेदन है कि हमने दिनांक 19.11.2025 को अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम को पत्र क्रमांक 1133 प्रेषित कर अनुरोध किया था कि वन भूमि हस्तांतरण (स्टेज-1 एवं स्टेज-2) से संबंधित हिंदरेंस को हिंदरेंस रजिस्टर में दिनांक 19.11.2025 से समाप्त/क्लीयर दर्शाया जाए।</p>

    <p>खेद है कि उक्त पत्र के 15 दिन से अधिक समय बीत जाने के बाद भी न तो हिंदरेंस रजिस्टर अपडेट की पुष्टि प्राप्त हुई है और न ही कोई उत्तर प्रेषित किया गया है।</p>

    <p>यह उल्लेखनीय है कि:</p>

    <ol>
      <li>वन क्लीयरेंस (स्टेज-1 एवं स्टेज-2) की एन.ओ.सी. हमें पहली बार दिनांक 19.11.2025 को ही प्राप्त हुई थी — इससे पूर्व यह हिंदरेंस विभागीय संचार की कमी के कारण थी, ठेकेदार की लापरवाही से नहीं।</li>
      <li>हिंदरेंस रजिस्टर में यह बिंदु अभी भी "क्लीयर" नहीं दर्शाया गया है, जिससे कार्य की प्रगति रिकॉर्ड प्रभावित हो रही है।</li>
    </ol>

    <p>अतः आपसे विनम्र किंतु दृढ़ अनुरोध है कि अधिशासी अभियन्ता को तत्काल निर्देश देकर:</p>

    <ol>
      <li>हिंदरेंस रजिस्टर में वन भूमि हस्तांतरण हिंदरेंस को दिनांक 19.11.2025 से समाप्त/क्लीयर दर्शाया जाए।</li>
      <li>इसकी लिखित पुष्टि हमें <strong>सात (7) दिवस के भीतर</strong> प्रेषित की जाए।</li>
    </ol>

    <p>आशा है आप इस विषय पर तत्काल कार्यवाही करेंगे।</p>

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

console.log('\nGenerating 02_Forest_Clearance_NOC PDFs...\n')
await makePDF(mainLetter, 'Letter1133_ForestNOC_HindranceUpdate_19Nov2025.pdf')
await makePDF(reminder, 'Reminder_ForestNOC_SE_BaneshwarDham.pdf')
console.log('\nDone.')
