// Seed data sourced from Luminaire Docs API (https://luminaire-docs.preview.emergentagent.com)
// Case: M/s Shri Bajrang Construction — PWD Dungarpur, Rajasthan
// Used as default data when no cases exist and API is unreachable

import type { Case, Correspondence } from '../types'

export const SEED_CASE: Omit<Case, 'id' | 'createdAt'> = {
  title: 'Construction of Amli Fala Bridge - Payment and Clearance Delays',
  title_hi: 'अमली फाला पुल निर्माण - भुगतान एवं क्लीयरेंस विलंब',
  caseNumber: 'PWD/2023-24/Construction/Amli-Fala',
  contractNo: 'AR/2023-24/1-D',
  workName: 'Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road',
  workName_hi: 'अमली फाला पुल एवं खेरवेड़ा नई बस्ती से वीरी बॉर्डर तक सड़क निर्माण',
  clientName: 'M/s Shri Bajrang Construction',
  clientDesignation: 'AA Class PWD Contractor',
  department: 'Public Works Department, Dungarpur (Raj.)',
  description: 'PWD construction project involving bridge construction with ongoing payment delays, forest clearance issues, and irrigation department approval delays. Contract value: ₹3,92,24,443.00',
  opposingParties: [
    { name: 'Jitendra Kr. Jain', designation: 'Executive Engineer', department: 'PWD Division Dungarpur', email: 'ee.dungarpur@pwd.rajasthan.gov.in', phone: '' },
    { name: 'Superintending Engineer', designation: 'Superintending Engineer', department: 'PWD Baneshwar Dham', email: '', phone: '' },
    { name: 'Additional Chief Engineer', designation: 'Additional Chief Engineer', department: 'PWD Circle Banswada', email: '', phone: '' },
  ],
  luminaireId: '928c13dc-f411-4aa0-a158-501f317ba490',
}

export function buildSeedCorrespondence(caseId: string): Omit<Correspondence, 'id' | 'createdAt' | 'updatedAt'>[] {
  return [
    {
      caseId,
      subject: 'Written Order to Commence Work — Amli Fala Bridge Construction',
      type: 'order',
      status: 'sent',
      date: '2023-07-17',
      from: 'Jitendra Kr. Jain (Executive Engineer, PWD Division Dungarpur)',
      to: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
      cc: [],
      referenceNumber: 'AR/2023-24/1-D',
      language: 'en',
      body: `OFFICE OF THE EXECUTIVE ENGINEER
PUBLIC WORK DEPARTMENT DIVISION DUNGARPUR (Raj.)

S. No. - AR/2023-24/1-D/-
Dated: 17.07.2023

To,
M/s Shri Bajrang Construction
"AA" Class PWD Contractor,
Padli Gujreshwar Distt. Dungarpur (Raj.)

Subject: WRITTEN ORDER TO COMMENCE WORK
Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road.

Reference: Your Tender Dated 22.06.2023 & Letter Acceptance No. 1629 Dated 11.07.2023.

Sir,

Your tender for the above work amounting to ₹ 3,92,24,443.00 (Rupees Three Crore Ninety Two Lakhs Twenty Four Thousand Four Hundred Forty Three Only) @ 9.05% Below has been approved.

You are, therefore, requested to please contact the Assistant Engineers in charge of the work and start the work. The time allowed for completion of the work 06 Months.

10 percent Security Deposit will be deducted from each bill.

Stipulated date of commencement: 28.07.2023
Stipulated date of completion: 28.01.2024

You are directed to obtain STP from mining Deptt. before starting the work.

(Jitendra Kr. Jain)
Executive Engineer
PWD Dn Dungarpur`,
      luminaireId: 'a2ccae0c-c32d-4975-88ac-8a35ec14ec75',
    },
    {
      caseId,
      subject: 'Forest Clearance (Van Bhoomi Hastantaran) and Hindrances Register Update',
      subject_hi: 'वन भूमि हस्तांतरण एन.ओ.सी. एवं हिंदरेंस रजिस्टर अपडेट',
      type: 'notice',
      status: 'draft',
      date: '2025-11-19',
      from: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
      to: 'Superintending Engineer, PWD Baneshwar Dham',
      cc: [],
      referenceNumber: '1133',
      language: 'hi',
      body: '',
      body_hi: `सेवा में,
श्रीमान् अधिशाषी अभियन्ता
सा० नि० वि० खण्ड बेणेश्वरधाम

विषय: फरिस्ट क्लीयेरेंस से संबंधित एन.ओ.सी. (वन भूमि हस्तांतरण) एवं हिंदरेंस रजिस्टर अपडेट करने बावत।

महोदय,

कृपया सादर सूचित किया जाता है कि आज दिनांक 19.11.2025 को आपके कार्यालय से प्राप्त पत्र क्रमांक 1844 दिनांक 13.11.2025 एवं संलग्न वन विभाग के एन.ओ.सी. पत्रों के संदर्भ में निम्नांकित तथ्य रिकॉर्ड में लिये जाएँ:

1. उक्त वन क्लीयेरेंस (स्टेज-1 एवं स्टेज-2) से संबंधित कोई भी एन.ओ.सी. या कोई भी पत्र हमारे पास पहली बार आज ही प्राप्त हुआ है।

2. आपके पत्र में जिस संदर्भ पत्र/कम्युनिशेजन का उल्लेख किया गया है, वह पत्र हमें कभी प्राप्त ही नहीं हुआ था। इस कारण यह हिंदरेंस हमारी ओर से नहीं, बल्कि संचार में कमी के कारण उत्पन्न हुआ था।

3. जोकि आज पहली बार यह एन.ओ.सी. हमारे हाथ लगी है, इसलिए अब इस हिंदरेंस को तत्काल प्रभाव से पूर्ण रूप से समाप्त माना जाए तथा हिंदरेंस रजिस्टर में आज की तारीख से यह बिंदु "क्लीयर" दिखाया जाए।

अतः आपसे विनम्र अनुरोध है कि हिंदरेंस रजिस्टर में यह हिंदरेंस आज दिनांक 19.11.2025 से हटा हुआ/समाप्त दर्शाया जाए।

भवदीय,
मेसर्स बजरंग कंस्ट्रक्शन`,
      luminaireId: '4b020309-f7a0-4d15-89d2-288fa2677661',
    },
    {
      caseId,
      subject: 'Construction Program Progress and Pending Payment Issue',
      subject_hi: 'निर्माण कार्यक्रम की प्रगति एवं भुगतान लंबित होने के संबंध में',
      type: 'complaint',
      status: 'pending_reply',
      date: '2025-10-15',
      from: 'Manohar Patel, M/s Shri Bajrang Construction',
      to: 'Executive Engineer, PWD Division Baneshwar Dham',
      cc: [],
      referenceNumber: '337',
      language: 'hi',
      amount: 21996292,
      body: '',
      body_hi: `सेवा में,
अधिशासी अभियन्ता,
पि०, खण्ड, बेणेश्वरधाम

विषय: निर्माण कार्यक्रम की प्रगति एवं भुगतान लंबित होने के संबंध में।

महोदय,

निवेदन है कि उपरोक्त कार्य हेतु हमारे द्वारा निर्धारित निर्माण कार्यक्रम (Construction Programme) संलग्न है। परंतु खेद के साथ सूचित करना पड़ रहा है कि जुलाई 2024 से राशि रू. 21996292/- (रूपये दो करोड़ उन्नीस लाख छियानवे हजार दो सौ बानवे मात्र) की देय राशि विभागीय स्तर पर लंबित पड़ी हुई है।

इस भुगतान की अनुपलब्धता के कारण कार्य की गति रुक रही है। इस सन्दर्भ में पूर्व में भी मेरे द्वारा पत्र क्रमांक 237 दिनांक 10.07.2025 को लिखित रूप से आप को प्रेषित किया गया लेकिन इस पर कोई कार्यवाही नहीं कि गई एवं ना ही जवाब दिया गया।

अतः आपसे सादर अनुरोध है कि उक्त बकाया राशि का शीघ्र भुगतान करवाने हेतु संबंधित अधिकारी को तत्काल निर्देशित कृपा करें।

यह भी निवेदन है कि विभागीय अनुबंध की शर्तों के अनुसार समय पर भुगतान करना लोक निर्माण विभाग का पारस्परिक दायित्व है।

भवदीय,
(मनोहर पटेल)
मेसर्स श्री बजरंग कंस्ट्रक्शन`,
      luminaireId: 'e6f4cdba-2418-4750-a48e-464e84855346',
    },
    {
      caseId,
      subject: 'Strengthening and Widening of BT Road — Reasons for Delay and Objection to Work Withdrawal',
      subject_hi: 'सड़क निर्माण कार्य में विलंब के कारण एवं कार्य वापसी के विरुद्ध आपत्ति',
      type: 'response',
      status: 'draft',
      date: '2025-11-20',
      from: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
      to: 'Additional Chief Engineer, PWD Circle Banswada',
      cc: [],
      referenceNumber: 'JJ 32',
      language: 'hi',
      body: '',
      body_hi: `सेवा में,
श्रीमान् अतिरिक्त मुख्य अभियन्ता,
संभाग द्वितीय बांसवाड़ा

विषय: सडक निर्माण कार्य Strengthening and Widening of BT Road from Punjpur Kanthadi, Khermal Km 0/0 to 12/0. समय-सीमा में कार्य पूर्ण न होने के कारणो तथा कार्य वापस लेने के प्रस्ताव के विरूद्ध आपत्ति एवं अनुरोध

सन्दर्भ: आपे कार्यालय पत्र कमांक डी०-502 दिनांक 19.11.2025

महोदय,

सादर निवेदन है कि उपरोक्त संविदा के अंतर्गत निर्धारित समय में कार्य पूर्ण न होने के निम्नलिखित कारण हैं जो पूर्णतः विभागीय हैं:

1. वन भूमि क्लिऐरेंस (किमी 9+550 से 10+700) — निविदा दस्तावेज़ में इस रीच की वन भूमि का कोई उल्लेख नहीं था। स्टेज-1 एवं स्टेज-II वन स्वीकृति हमें पहली बार दिनांक 13.11.2025 को प्राप्त हुई है, जबकि संविदा की निर्धारित समाप्ति तिथि के 18 माह बाद की बात है।

2. सिंचाई नहर पर प्रमुख सी.डी. कार्य की अनुमति लगभग रु. 100.00 लाख है, की अनुमति आज तक सिंचाई विभाग से प्राप्त नहीं हुई है।

3. रनिंग बिलों का भुगतान जुलाई 2024 से अब तक कुल रु. 2.50 करोड़ (लगभग) के रनिंग बिल लंबित है।

हमने संशोधित निर्माण कार्यक्रम (Revised Bar Chart) पहले ही आपके समक्ष प्रस्तुत कर दिया है। विलंब पूर्णतः विभागीय कारणों से हुआ है।

भवदीय,
मेसर्स बजरंग कंस्ट्रक्शन`,
      luminaireId: '661880ca-681e-44cd-9428-5944e182ea78',
    },
  ]
}
