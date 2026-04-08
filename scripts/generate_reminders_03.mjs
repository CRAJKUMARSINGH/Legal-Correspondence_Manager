/**
 * PDF Generator — 03_Pending_Payment_Complaint
 * Reminder 1: To EE PWD Baneshwar Dham (Hindi)
 * Reminder 2: Escalation to SE PWD Baneshwar Dham (Hindi)
 */

import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '..', 'Correspondence_2026', 'Bajrang_Construction', '03_Pending_Payment_Complaint')

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
  .amount-box {
    border: 1.5px solid #1e3570;
    padding: 10px 16px;
    margin: 12px 0;
    background: #f7f9ff;
    font-size: 11.5pt;
  }
  .amount-box table { border-collapse: collapse; width: 100%; }
  .amount-box td { padding: 4px 8px; }
  .amount-box td:last-child { text-align: right; font-weight: bold; }
  .amount-box .total-row td {
    border-top: 2px solid #1e3570;
    font-weight: bold;
    font-size: 12.5pt;
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
  .divider { border: none; border-top: 1px solid #ccc; margin: 16px 0; }
`

// ── Reminder 1 ────────────────────────────────────────────────────────────────
const reminder1 = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/07</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अधिशासी अभियन्ता,</strong><br>
    लोक निर्माण विभाग खण्ड,<br>
    बेणेश्वरधाम (राज.)
  </div>

  <div class="subject-line">
    विषय: स्मरण पत्र — लंबित रनिंग बिलों के भुगतान के संबंध में<br>
    (संदर्भ: हमारे पत्र क्रमांक 237 दि. 10.07.2025 एवं पत्र क्रमांक 337 दि. 15.10.2025)
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. हमारा पत्र क्रमांक 237 दिनांक 10.07.2025<br>
    3. हमारा पत्र क्रमांक 337 दिनांक 15.10.2025</p>

    <p>महोदय,</p>

    <p>उपरोक्त संदर्भित पत्रों के क्रम में सादर निवेदन है कि <strong>अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण कार्य</strong> (अनुबंध क्रमांक AR/2023-24/1-D) के अंतर्गत जुलाई 2024 से लंबित रनिंग बिलों की देय राशि आज दिनांक तक भी विभागीय स्तर पर अदा नहीं की गई है।</p>

    <div class="amount-box">
      <table>
        <tr><td>जुलाई 2024 से लंबित मूल देय राशि</td><td>₹ 2,19,96,292/-</td></tr>
        <tr><td>18% वार्षिक ब्याज (भारतीय संविदा अधिनियम धारा 73/74 अनुसार)</td><td>अतिरिक्त देय</td></tr>
        <tr class="total-row"><td>कुल देय राशि (ब्याज सहित)</td><td>तत्काल भुगतान योग्य</td></tr>
      </table>
    </div>

    <p>यह खेद का विषय है कि हमारे पत्र क्रमांक 237 दिनांक 10.07.2025 एवं पत्र क्रमांक 337 दिनांक 15.10.2025 के बावजूद न तो कोई भुगतान किया गया और न ही कोई उत्तर प्रेषित किया गया। इस विभागीय उदासीनता के कारण निर्माण कार्य की गति पूर्णतः अवरुद्ध हो गई है तथा हमारी फर्म को गंभीर आर्थिक क्षति हो रही है।</p>

    <p>अनुबंध की शर्तों के अनुसार विभाग का यह पारस्परिक दायित्व है कि प्रत्येक रनिंग बिल प्रस्तुति के <strong>एक माह के भीतर</strong> भुगतान किया जाए। इस दायित्व का पालन न करना अनुबंध का उल्लंघन है।</p>

    <p>अतः आपसे <strong>सात (7) दिवस के भीतर</strong> निम्नलिखित कार्यवाही करने का विनम्र किंतु दृढ़ अनुरोध है:</p>

    <ol>
      <li>लंबित रनिंग बिलों की समस्त देय राशि ₹ 2,19,96,292/- का तत्काल भुगतान।</li>
      <li>भुगतान की तिथि एवं राशि की लिखित सूचना हमें प्रेषित करें।</li>
      <li>भविष्य में प्रत्येक रनिंग बिल का भुगतान अनुबंध की शर्तों के अनुसार एक माह में सुनिश्चित करें।</li>
    </ol>

    <div class="warn-box">
      <p><strong>चेतावनी:</strong> यदि उक्त अवधि में भुगतान नहीं किया गया तो हम निम्नलिखित कदम उठाने हेतु बाध्य होंगे:</p>
      <ol>
        <li>अधीक्षण अभियन्ता / अतिरिक्त मुख्य अभियन्ता को उच्चस्तरीय शिकायत।</li>
        <li>मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत मध्यस्थता कार्यवाही।</li>
        <li>सतर्कता विभाग / भ्रष्टाचार निरोधक ब्यूरो में शिकायत।</li>
        <li>सूचना का अधिकार अधिनियम के तहत आवेदन।</li>
        <li>अनुबंध शर्तों के अंतर्गत कार्यस्थल पर कार्य स्थगन।</li>
      </ol>
    </div>

    <p>आशा है आप इस विषय को गंभीरता से लेते हुए तत्काल कार्यवाही करेंगे।</p>

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

// ── Reminder 2 / Escalation ───────────────────────────────────────────────────
const reminder2 = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/08</td></tr>
    <tr><td>दिनांक</td><td>: 10.04.2026</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अधीक्षण अभियन्ता,</strong><br>
    लोक निर्माण विभाग,<br>
    बेणेश्वरधाम (राज.)
  </div>

  <table class="meta-table" style="margin-bottom:14px">
    <tr>
      <td style="width:60px">प्रतिलिपि:</td>
      <td>
        1. अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. संभाग द्वितीय, बांसवाड़ा<br>
        2. अधिशासी अभियन्ता, लो.नि.वि. खण्ड, बेणेश्वरधाम (सूचनार्थ एवं आवश्यक कार्यवाही हेतु)
      </td>
    </tr>
  </table>

  <div class="subject-line">
    विषय: उच्चस्तरीय शिकायत — जुलाई 2024 से लंबित रनिंग बिल राशि ₹ 2,19,96,292/-<br>
    का भुगतान न होने एवं अधिशासी अभियन्ता की जानबूझकर उदासीनता के संबंध में<br>
    (अनुबंध क्रमांक AR/2023-24/1-D — अमली फाला पुल निर्माण)
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. हमारा पत्र क्रमांक 237 दिनांक 10.07.2025 (अधिशासी अभियन्ता को)<br>
    3. हमारा पत्र क्रमांक 337 दिनांक 15.10.2025 (अधिशासी अभियन्ता को)<br>
    4. हमारा स्मरण पत्र क्रमांक SBC/PWD/2026/07 दिनांक 10.04.2026 (अधिशासी अभियन्ता को)</p>

    <p>महोदय,</p>

    <p>अत्यंत खेद एवं विवशता के साथ आपके संज्ञान में लाना आवश्यक हो गया है कि <strong>अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण कार्य</strong> (अनुबंध क्रमांक AR/2023-24/1-D) के अंतर्गत जुलाई 2024 से लंबित रनिंग बिल राशि <strong>₹ 2,19,96,292/-</strong> का भुगतान आज दिनांक तक नहीं किया गया है।</p>

    <p>हमने इस संबंध में अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम को निम्नलिखित पत्र प्रेषित किए, परंतु किसी पर भी कोई कार्यवाही नहीं की गई और न ही कोई उत्तर दिया गया:</p>

    <div class="amount-box">
      <table>
        <tr><td>पत्र क्रमांक 237</td><td>दिनांक 10.07.2025</td></tr>
        <tr><td>पत्र क्रमांक 337</td><td>दिनांक 15.10.2025</td></tr>
        <tr><td>स्मरण पत्र क्रमांक SBC/PWD/2026/07</td><td>दिनांक 10.04.2026</td></tr>
        <tr class="total-row"><td>कुल पत्र प्रेषित</td><td>3 पत्र — कोई उत्तर/कार्यवाही नहीं</td></tr>
      </table>
    </div>

    <p>अधिशासी अभियन्ता द्वारा बार-बार लिखित अनुरोध के बावजूद भुगतान न करना एवं कोई उत्तर न देना <strong>जानबूझकर की गई उदासीनता, कर्तव्य का उल्लंघन एवं विभागीय अनुबंध की शर्तों का सुस्पष्ट उल्लंघन</strong> है। इस कारण:</p>

    <ol>
      <li>निर्माण कार्य की गति पूर्णतः अवरुद्ध हो गई है।</li>
      <li>हमारी फर्म को भारी आर्थिक क्षति हो रही है।</li>
      <li>भारतीय संविदा अधिनियम 1872 की धारा 73 एवं 74 के अंतर्गत ब्याज एवं क्षतिपूर्ति की राशि निरंतर बढ़ रही है।</li>
    </ol>

    <p>अतः आपसे <strong>सात (7) दिवस के भीतर</strong> निम्नलिखित कार्यवाही का विनम्र किंतु दृढ़ अनुरोध है:</p>

    <ol>
      <li>अधिशासी अभियन्ता को तत्काल निर्देश देकर लंबित राशि <strong>₹ 2,19,96,292/-</strong> का भुगतान सुनिश्चित करवाएं।</li>
      <li>अधिशासी अभियन्ता को उनकी जानबूझकर उदासीनता एवं कर्तव्य-विमुखता के लिए <strong>कारण बताओ नोटिस / विभागीय जाँच</strong> का आदेश दें।</li>
      <li>भविष्य में अनुबंध की शर्तों के अनुसार समय पर भुगतान सुनिश्चित करने हेतु उचित निर्देश जारी करें।</li>
    </ol>

    <div class="warn-box">
      <p><strong>चेतावनी — यदि 7 दिवस में कार्यवाही नहीं हुई:</strong></p>
      <ol>
        <li>मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत <strong>मध्यस्थता कार्यवाही</strong> प्रारंभ की जाएगी।</li>
        <li>सतर्कता विभाग / भ्रष्टाचार निरोधक ब्यूरो में <strong>औपचारिक शिकायत</strong> दर्ज की जाएगी।</li>
        <li>सूचना का अधिकार अधिनियम के तहत <strong>आर.टी.आई. आवेदन</strong> प्रस्तुत किया जाएगा।</li>
        <li>अनुबंध शर्तों के अंतर्गत <strong>कार्यस्थल पर कार्य स्थगन</strong> किया जाएगा।</li>
        <li>भारतीय संविदा अधिनियम 1872 की धारा 73 के अंतर्गत <strong>अतिरिक्त क्षतिपूर्ति</strong> का दावा किया जाएगा।</li>
      </ol>
    </div>

    <p>आशा है आप इस गंभीर विषय पर तत्काल एवं प्रभावी कार्यवाही करेंगे।</p>

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

console.log('\nGenerating Hindi reminder PDFs...\n')
await makePDF(reminder1, 'Reminder1_Hindi_EE_BaneshwarDham_10Apr2026.pdf')
await makePDF(reminder2, 'Reminder2_Hindi_Escalation_SE_10Apr2026.pdf')
console.log('\nDone.')
