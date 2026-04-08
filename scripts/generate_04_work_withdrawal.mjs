/**
 * PDF Generator — 04_Work_Withdrawal_Objection
 * Letter JJ 32 dated 20.11.2025 — Objection to Work Withdrawal Proposal
 * + Reminder + Escalation to CE/Secretary
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
  .info-box table { border-collapse: collapse; width: 100%; }
  .info-box td { padding: 3px 6px; }
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
`

// ── Letter JJ 32 — Main Objection Letter (Hindi) ─────────────────────────────
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
    <tr><td>पत्र क्रमांक</td><td>: JJ 32</td></tr>
    <tr><td>दिनांक</td><td>: 20.11.2025</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अतिरिक्त मुख्य अभियन्ता,</strong><br>
    लोक निर्माण विभाग, संभाग द्वितीय,<br>
    बांसवाड़ा (राज.)
  </div>

  <div class="subject-line">
    विषय: सड़क निर्माण कार्य — Strengthening and Widening of BT Road from Punjpur Kanthadi,<br>
    Khermal Km 0/0 to 12/0 — समय-सीमा में कार्य पूर्ण न होने के कारण तथा<br>
    कार्य वापस लेने के प्रस्ताव के विरुद्ध आपत्ति एवं अनुरोध।
  </div>

  <div class="body-text">

    <p>संदर्भ: आपके कार्यालय पत्र क्रमांक डी०-502 दिनांक 19.11.2025</p>

    <p>महोदय,</p>

    <p>सादर निवेदन है कि उपरोक्त संविदा के अंतर्गत निर्धारित समय में कार्य पूर्ण न होने के निम्नलिखित कारण हैं, जो <strong>पूर्णतः विभागीय हैं</strong> एवं ठेकेदार की किसी भी लापरवाही से उत्पन्न नहीं हुए:</p>

    <ol>
      <li>
        <strong>वन भूमि क्लीयरेंस (किमी 9+550 से 10+700):</strong> निविदा दस्तावेज़ में इस रीच की वन भूमि का कोई उल्लेख नहीं था। स्टेज-1 एवं स्टेज-2 वन स्वीकृति हमें <strong>पहली बार दिनांक 13.11.2025 को प्राप्त हुई</strong> — जो संविदा की निर्धारित समाप्ति तिथि के लगभग 18 माह बाद है।
      </li>
      <li>
        <strong>सिंचाई नहर पर प्रमुख सी.डी. कार्य:</strong> लगभग ₹ 1,00,00,000/- (एक करोड़ रुपये) के इस कार्य की अनुमति आज दिनांक तक सिंचाई विभाग से प्राप्त नहीं हुई है।
      </li>
      <li>
        <strong>रनिंग बिलों का लंबित भुगतान:</strong> जुलाई 2024 से अब तक कुल लगभग <strong>₹ 2,50,00,000/- (ढाई करोड़ रुपये)</strong> के रनिंग बिल लंबित हैं, जिससे निर्माण कार्य की गति गंभीर रूप से प्रभावित हुई है।
      </li>
    </ol>

    <div class="info-box">
      <p>हमने संशोधित निर्माण कार्यक्रम (Revised Bar Chart) पहले ही आपके समक्ष प्रस्तुत कर दिया है। उपरोक्त सभी विलंब पूर्णतः विभागीय कारणों से हुए हैं।</p>
    </div>

    <p>अतः आपसे विनम्र किंतु दृढ़ अनुरोध है कि:</p>

    <ol>
      <li>कार्य वापस लेने के प्रस्ताव को <strong>तत्काल वापस लिया जाए</strong>।</li>
      <li>विभागीय विलंब के अनुपात में <strong>उचित समय-विस्तार (Time Extension)</strong> प्रदान किया जाए।</li>
      <li>लंबित रनिंग बिल राशि <strong>₹ 2,50,00,000/- का तत्काल भुगतान</strong> सुनिश्चित किया जाए।</li>
      <li>सिंचाई विभाग से सी.डी. कार्य की अनुमति <strong>शीघ्र दिलवाई जाए</strong>।</li>
    </ol>

    <div class="warn-box">
      <p><strong>चेतावनी:</strong> यदि उचित समय में कार्यवाही नहीं की गई तो हम निम्नलिखित कदम उठाने हेतु बाध्य होंगे:</p>
      <ol>
        <li>मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत मध्यस्थता कार्यवाही।</li>
        <li>मुख्य अभियन्ता / सचिव, लोक निर्माण विभाग, राजस्थान को उच्चस्तरीय शिकायत।</li>
        <li>सतर्कता विभाग / भ्रष्टाचार निरोधक ब्यूरो में शिकायत।</li>
        <li>भारतीय संविदा अधिनियम 1872 की धारा 73 के अंतर्गत अतिरिक्त क्षतिपूर्ति का दावा।</li>
      </ol>
    </div>

    <p>आशा है आप इस विषय को गंभीरता से लेते हुए तत्काल एवं न्यायोचित कार्यवाही करेंगे।</p>

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

// ── Reminder — if no reply within 10 days ────────────────────────────────────
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
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/10</td></tr>
    <tr><td>दिनांक</td><td>: [दिनांक]</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् अतिरिक्त मुख्य अभियन्ता,</strong><br>
    लोक निर्माण विभाग, संभाग द्वितीय,<br>
    बांसवाड़ा (राज.)
  </div>

  <table class="meta-table" style="margin-bottom:14px">
    <tr>
      <td style="width:60px">प्रतिलिपि:</td>
      <td>
        1. अधीक्षण अभियन्ता, लो.नि.वि. बेणेश्वरधाम<br>
        2. अधिशासी अभियन्ता, लो.नि.वि. खण्ड बेणेश्वरधाम (सूचनार्थ)
      </td>
    </tr>
  </table>

  <div class="subject-line">
    विषय: स्मरण पत्र — कार्य वापसी के प्रस्ताव के विरुद्ध आपत्ति पर उत्तर हेतु<br>
    (संदर्भ: हमारा पत्र क्रमांक JJ 32 दिनांक 20.11.2025 | आपका पत्र क्रमांक डी०-502 दिनांक 19.11.2025)
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. आपके कार्यालय का पत्र क्रमांक डी०-502 दिनांक 19.11.2025<br>
    2. हमारा पत्र क्रमांक JJ 32 दिनांक 20.11.2025</p>

    <p>महोदय,</p>

    <p>उपरोक्त संदर्भित पत्रों के क्रम में सादर निवेदन है कि हमने दिनांक 20.11.2025 को पत्र क्रमांक JJ 32 के माध्यम से आपके कार्यालय के पत्र क्रमांक डी०-502 दिनांक 19.11.2025 में प्रस्तावित कार्य वापसी के विरुद्ध विस्तृत आपत्ति प्रस्तुत की थी।</p>

    <p>हमने स्पष्ट रूप से प्रमाणित किया था कि सभी विलंब पूर्णतः विभागीय कारणों से हुए हैं:</p>

    <ol>
      <li>वन क्लीयरेंस (स्टेज-1 एवं स्टेज-2) — संविदा समाप्ति तिथि के 18 माह बाद दिनांक 13.11.2025 को पहली बार प्राप्त।</li>
      <li>सिंचाई विभाग से सी.डी. कार्य की अनुमति (लगभग ₹ 1.00 करोड़) — आज तक प्राप्त नहीं।</li>
      <li>जुलाई 2024 से लंबित रनिंग बिल — लगभग ₹ 2.50 करोड़।</li>
    </ol>

    <p>खेद है कि उक्त पत्र के 10 दिन से अधिक समय बीत जाने के बाद भी कोई लिखित उत्तर प्राप्त नहीं हुआ है।</p>

    <p>अतः आपसे <strong>सात (7) दिवस के भीतर</strong> निम्नलिखित कार्यवाही का अनुरोध है:</p>

    <ol>
      <li>कार्य वापसी के प्रस्ताव को वापस लेने की लिखित पुष्टि।</li>
      <li>विभागीय विलंब के अनुपात में उचित समय-विस्तार की स्वीकृति।</li>
      <li>लंबित रनिंग बिल राशि के भुगतान की कार्यवाही।</li>
    </ol>

    <div class="warn-box">
      <p><strong>चेतावनी:</strong> यदि उक्त अवधि में उत्तर/कार्यवाही नहीं हुई तो हम मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत मध्यस्थता कार्यवाही प्रारंभ करने तथा उचित कानूनी/न्यायिक मंच का सहारा लेने हेतु बाध्य होंगे।</p>
    </div>

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

// ── Escalation — to CE/Secretary ─────────────────────────────────────────────
const escalation = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head><body>

  <div class="header-bar">
    <div class="firm-name">मेसर्स श्री बजरंग कंस्ट्रक्शन</div>
    <div class="firm-sub">M/s Shri Bajrang Construction &nbsp;|&nbsp; "AA" क्लास पी.डब्ल्यू.डी. ठेकेदार &nbsp;|&nbsp; पडली गुजरेश्वर, जिला डूंगरपुर (राज.)</div>
  </div>

  <table class="meta-table">
    <tr><td>पत्र क्रमांक</td><td>: SBC/PWD/2026/11</td></tr>
    <tr><td>दिनांक</td><td>: [दिनांक]</td></tr>
  </table>

  <div class="to-block">
    सेवा में,<br>
    <strong>श्रीमान् मुख्य अभियन्ता / सचिव,</strong><br>
    लोक निर्माण विभाग,<br>
    राजस्थान सरकार
  </div>

  <div class="subject-line">
    विषय: उच्चस्तरीय शिकायत — विभागीय विलंब के बावजूद अन्यायपूर्ण कार्य वापसी का प्रस्ताव<br>
    (संविदा: BT Road Km 0/0 to 12/0 | ठेकेदार: मेसर्स श्री बजरंग कंस्ट्रक्शन)
  </div>

  <div class="body-text">

    <p>संदर्भ:<br>
    1. कार्यादेश / अनुबंध क्रमांक AR/2023-24/1-D दिनांक 17.07.2023<br>
    2. अतिरिक्त मुख्य अभियन्ता का पत्र क्रमांक डी०-502 दिनांक 19.11.2025<br>
    3. हमारा आपत्ति पत्र क्रमांक JJ 32 दिनांक 20.11.2025<br>
    4. हमारा स्मरण पत्र क्रमांक SBC/PWD/2026/10 दिनांक [दिनांक]</p>

    <p>महोदय,</p>

    <p>अत्यंत खेद एवं विवशता के साथ आपके संज्ञान में लाना आवश्यक हो गया है कि हमारी विस्तृत आपत्ति (पत्र क्रमांक JJ 32 दिनांक 20.11.2025) एवं स्मरण पत्र के बावजूद अतिरिक्त मुख्य अभियन्ता, लो.नि.वि. संभाग द्वितीय बांसवाड़ा की ओर से कोई उत्तर या कार्यवाही नहीं की गई है।</p>

    <p>सभी विलंब पूर्णतः विभागीय कारणों से हुए हैं:</p>

    <ol>
      <li><strong>वन क्लीयरेंस:</strong> स्टेज-1 एवं स्टेज-2 की एन.ओ.सी. संविदा समाप्ति तिथि के 18 माह बाद दिनांक 13.11.2025 को पहली बार प्राप्त हुई।</li>
      <li><strong>सिंचाई विभाग की अनुमति:</strong> सी.डी. कार्य (लगभग ₹ 1.00 करोड़) की अनुमति आज तक प्राप्त नहीं।</li>
      <li><strong>लंबित भुगतान:</strong> जुलाई 2024 से लगभग ₹ 2.50 करोड़ के रनिंग बिल लंबित हैं।</li>
    </ol>

    <p>अतः आपसे विनम्र किंतु दृढ़ अनुरोध है कि:</p>

    <ol>
      <li>कार्य वापसी के प्रस्ताव को <strong>तत्काल वापस लिया जाए</strong>।</li>
      <li>विभागीय विलंब के अनुपात में <strong>उचित समय-विस्तार</strong> प्रदान किया जाए।</li>
      <li>लंबित रनिंग बिल राशि <strong>₹ 2,50,00,000/-</strong> का तत्काल भुगतान सुनिश्चित किया जाए।</li>
    </ol>

    <div class="warn-box">
      <p><strong>चेतावनी — यदि शीघ्र कार्यवाही नहीं हुई:</strong></p>
      <ol>
        <li>मध्यस्थता एवं सुलह अधिनियम 1996 के अंतर्गत मध्यस्थता कार्यवाही प्रारंभ की जाएगी।</li>
        <li>सतर्कता विभाग / भ्रष्टाचार निरोधक ब्यूरो में औपचारिक शिकायत दर्ज की जाएगी।</li>
        <li>सूचना का अधिकार अधिनियम के तहत आर.टी.आई. आवेदन प्रस्तुत किया जाएगा।</li>
        <li>भारतीय संविदा अधिनियम 1872 की धारा 73 के अंतर्गत अतिरिक्त क्षतिपूर्ति का दावा किया जाएगा।</li>
      </ol>
    </div>

    <p>आशा है आप इस गंभीर विषय पर तत्काल एवं प्रभावी हस्तक्षेप करेंगे।</p>

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

console.log('\nGenerating 04_Work_Withdrawal_Objection PDFs...\n')
await makePDF(mainLetter, 'LetterJJ32_WorkWithdrawalObjection_Hindi_20Nov2025.pdf')
await makePDF(reminder, 'Reminder_WorkWithdrawal_ACE_Banswada.pdf')
await makePDF(escalation, 'Escalation_WorkWithdrawal_CE_Secretary.pdf')
console.log('\nDone.')
