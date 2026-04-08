/**
 * Robotic Test — Legal Correspondence Manager
 * ============================================
 * Simulates: upload letter → text instruction → AI draft generation
 * Runs 51 drafts per sample letter (25 Hindi + 26 English)
 * across all 4 Bajrang Construction seed letters.
 *
 * Usage:
 *   node scripts/robotic_test.mjs --apiKey=sk-...
 *   or set env: OPENAI_API_KEY=sk-...
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT_ROOT = path.join(ROOT, 'Correspondence_2026', 'Bajrang_Construction')

// ── Parse API key ────────────────────────────────────────────────────────────
const apiKey =
  process.argv.find(a => a.startsWith('--apiKey='))?.split('=')[1] ??
  process.env.OPENAI_API_KEY ?? ''

if (!apiKey) {
  console.error('ERROR: Provide --apiKey=sk-... or set OPENAI_API_KEY env var')
  process.exit(1)
}

// ── Case info (mirrors seedData.ts) ─────────────────────────────────────────
const CASE_INFO = {
  title: 'Construction of Amli Fala Bridge - Payment and Clearance Delays',
  contractNo: 'AR/2023-24/1-D',
  workName: 'Construction of Amli Fala Bridge and Kherveda Nai Basti to Veeri Border via Kunjiya Vali Mata Road',
  clientName: 'M/s Shri Bajrang Construction',
  clientDesignation: 'AA Class PWD Contractor',
  department: 'Public Works Department, Dungarpur (Raj.)',
  description: 'PWD construction project involving bridge construction with ongoing payment delays, forest clearance issues, and irrigation department approval delays. Contract value: ₹3,92,24,443.00',
  opposingParties: [
    { name: 'Jitendra Kr. Jain', designation: 'Executive Engineer', department: 'PWD Division Dungarpur' },
    { name: 'Superintending Engineer', designation: 'Superintending Engineer', department: 'PWD Baneshwar Dham' },
    { name: 'Additional Chief Engineer', designation: 'Additional Chief Engineer', department: 'PWD Circle Banswada' },
  ],
}

// ── 4 Seed letters (input) ───────────────────────────────────────────────────
const LETTERS = [
  {
    folder: '01_Work_Commencement_Order',
    id: 'letter-01',
    caseId: 'bajrang-case-01',
    subject: 'Written Order to Commence Work — Amli Fala Bridge Construction',
    type: 'order',
    status: 'sent',
    date: '2023-07-17',
    from: 'Jitendra Kr. Jain (Executive Engineer, PWD Division Dungarpur)',
    to: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
    referenceNumber: 'AR/2023-24/1-D',
    language: 'en',
    body: fs.readFileSync(path.join(OUT_ROOT, '01_Work_Commencement_Order', 'input.txt'), 'utf8'),
    body_hi: '',
    createdAt: '2023-07-17T00:00:00.000Z',
    updatedAt: '2023-07-17T00:00:00.000Z',
  },
  {
    folder: '02_Forest_Clearance_NOC',
    id: 'letter-02',
    caseId: 'bajrang-case-01',
    subject: 'Forest Clearance (Van Bhoomi Hastantaran) and Hindrances Register Update',
    type: 'notice',
    status: 'draft',
    date: '2025-11-19',
    from: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
    to: 'Superintending Engineer, PWD Baneshwar Dham',
    referenceNumber: '1133',
    language: 'hi',
    body: '',
    body_hi: fs.readFileSync(path.join(OUT_ROOT, '02_Forest_Clearance_NOC', 'input.txt'), 'utf8'),
    createdAt: '2025-11-19T00:00:00.000Z',
    updatedAt: '2025-11-19T00:00:00.000Z',
  },
  {
    folder: '03_Pending_Payment_Complaint',
    id: 'letter-03',
    caseId: 'bajrang-case-01',
    subject: 'Construction Program Progress and Pending Payment Issue',
    type: 'complaint',
    status: 'pending_reply',
    date: '2025-10-15',
    from: 'Manohar Patel, M/s Shri Bajrang Construction',
    to: 'Executive Engineer, PWD Division Baneshwar Dham',
    referenceNumber: '337',
    language: 'hi',
    amount: 21996292,
    interestRate: 18,
    daysOverdue: 456,
    body: '',
    body_hi: fs.readFileSync(path.join(OUT_ROOT, '03_Pending_Payment_Complaint', 'input.txt'), 'utf8'),
    createdAt: '2025-10-15T00:00:00.000Z',
    updatedAt: '2025-10-15T00:00:00.000Z',
  },
  {
    folder: '04_Work_Withdrawal_Objection',
    id: 'letter-04',
    caseId: 'bajrang-case-01',
    subject: 'Strengthening and Widening of BT Road — Reasons for Delay and Objection to Work Withdrawal',
    type: 'response',
    status: 'draft',
    date: '2025-11-20',
    from: 'M/s Shri Bajrang Construction (AA Class PWD Contractor)',
    to: 'Additional Chief Engineer, PWD Circle Banswada',
    referenceNumber: 'JJ 32',
    language: 'hi',
    body: '',
    body_hi: fs.readFileSync(path.join(OUT_ROOT, '04_Work_Withdrawal_Objection', 'input.txt'), 'utf8'),
    createdAt: '2025-11-20T00:00:00.000Z',
    updatedAt: '2025-11-20T00:00:00.000Z',
  },
]

// ── Draft types to cycle through ─────────────────────────────────────────────
const DRAFT_TYPES = ['reminder', 'payment_demand', 'escalation', 'fresh_notice', 'improve']

// ── System prompt (mirrors aiDraftV2.ts) ─────────────────────────────────────
const SYSTEM_PROMPT = `You are a senior Indian legal correspondence expert specializing in PWD/CPWD construction contracts, government departments, and civil engineering disputes in Rajasthan. You draft formal legal letters with:
- Precise legal language citing relevant provisions (Indian Contract Act Sections 55, 73, 74; Arbitration & Conciliation Act 1996; CPWD/PWD General Conditions of Contract)
- Firm but professional tone — assertive without being aggressive
- Clear demands with specific deadlines (7 days for reminders, 15 days for payment demands)
- Proper PWD escalation hierarchy: Executive Engineer → Superintending Engineer → Additional Chief Engineer → Chief Engineer
- Interest calculations under Section 73/74 of Indian Contract Act at 18% per annum
- References to ALL previous correspondence for continuity (cite letter numbers and dates)
Always structure letters with:
1. Office/sender address block
2. Reference No. and Date
3. Addressee block
4. Subject line (underlined)
5. Reference to previous letters
6. Body paragraphs (numbered points)
7. Specific demand/action required with deadline
8. Consequences of non-compliance (arbitration, court, RTI, departmental inquiry)
9. Closing (Yours faithfully / भवदीय)
10. Signature block`

// ── Build prompt (mirrors aiDraftV2.ts buildPrompt) ──────────────────────────
function buildPrompt(type, letter, lang, runIndex) {
  const langLabel = lang === 'hi' ? 'Hindi (Devanagari script)' : 'English'
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  const caseCtx = [
    `Case: ${CASE_INFO.title}`,
    `Contract No: ${CASE_INFO.contractNo}`,
    `Work: ${CASE_INFO.workName}`,
    `Client/Contractor: ${CASE_INFO.clientName} (${CASE_INFO.clientDesignation})`,
    `Department: ${CASE_INFO.department}`,
    `Background: ${CASE_INFO.description}`,
    `Opposing Officers:\n${CASE_INFO.opposingParties.map(p => `  - ${p.name}, ${p.designation}, ${p.department}`).join('\n')}`,
  ].join('\n')

  const prevLetter = `\nINPUT LETTER (uploaded):\nRef#${letter.referenceNumber} dated ${letter.date}\nFrom: ${letter.from}\nTo: ${letter.to}\nSubject: ${letter.subject}\nContent:\n${(letter.body || letter.body_hi).slice(0, 800)}`

  const interest = letter.amount && letter.daysOverdue && letter.interestRate
    ? Math.round(letter.amount * letter.interestRate * letter.daysOverdue / 36500)
    : null

  const variation = `\n[Variation #${runIndex + 1} — generate a distinct version with different phrasing, emphasis, or additional legal points]`

  switch (type) {
    case 'reminder':
      return `Draft a formal legal REMINDER letter in ${langLabel} dated ${today}.
${caseCtx}
${prevLetter}
REQUIREMENTS:
- This is a REMINDER — previous letter sent but NO reply or action received
- Reference previous letter Ref#${letter.referenceNumber} dated ${letter.date}
- Use assertive legal language: "despite repeated requests", "willful non-compliance", "dereliction of duty"
- Set firm 7-day deadline for compliance
- Warn: failure will result in arbitration under Arbitration & Conciliation Act 1996
${variation}
Write the complete letter ready to print and send.`

    case 'payment_demand':
      return `Draft a formal PAYMENT DEMAND letter with interest and damages in ${langLabel} dated ${today}.
${caseCtx}
${prevLetter}
FINANCIAL DETAILS:
- Principal amount due: ₹${(letter.amount ?? 21996292).toLocaleString('en-IN')}
- Interest rate: ${letter.interestRate ?? 18}% per annum
- Days overdue: ${letter.daysOverdue ?? 456}
- Calculated interest: ₹${(interest ?? Math.round(21996292 * 18 * 456 / 36500)).toLocaleString('en-IN')}
REQUIREMENTS:
- Cite Section 73 and 74 of Indian Contract Act for damages
- Demand: principal + interest + consequential damages
- Give 15-day ultimatum
${variation}
Write the complete letter ready to print and send.`

    case 'escalation':
      return `Draft a formal ESCALATION letter in ${langLabel} dated ${today}.
${caseCtx}
${prevLetter}
ESCALATION TARGET: Additional Chief Engineer / Chief Engineer
REQUIREMENTS:
- Name the Executive Engineer specifically and document each act of negligence with dates
- Use strong language: "intentional neglect", "willful default", "dereliction of duty"
- Demand: immediate intervention, release of pending payment within 7 days, departmental inquiry
- Warn: RTI application, complaint to Vigilance Department, and legal proceedings
${variation}
Write the complete letter with proper CC list, ready to print and send.`

    case 'fresh_notice':
      return `Draft a fresh formal LEGAL NOTICE in ${langLabel} dated ${today}.
${caseCtx}
${prevLetter}
REQUIREMENTS:
- Professional legal notice format
- Clear chronological statement of facts and grievances
- Specific demands with timeline
- Legal consequences of non-compliance (arbitration, court proceedings, damages)
${variation}
Write the complete legal notice ready to print and send.`

    case 'improve':
      return `Improve the following legal draft in ${langLabel} dated ${today}.
${caseCtx}
${prevLetter}
ORIGINAL DRAFT TO IMPROVE:
${(letter.body || letter.body_hi).slice(0, 800)}
REQUIREMENTS:
- Polished, more professional, and firm legal tone
- Standardize structure per PWD/CPWD legal practice
- Ensure proper legal citations are included
- Remove any ambiguity or passive language
${variation}
Write the complete IMPROVED letter ready to print and send.`

    default:
      return `Draft a formal legal letter in ${langLabel} dated ${today}.\n${caseCtx}\n${prevLetter}`
  }
}

// ── Call OpenAI API ───────────────────────────────────────────────────────────
async function generateDraft(type, letter, lang, runIndex) {
  const prompt = buildPrompt(type, letter, lang, runIndex)
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.45,
      max_tokens: 2000,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content ?? ''
}

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Main runner ───────────────────────────────────────────────────────────────
async function run() {
  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log('║  ROBOTIC TEST — Legal Correspondence Manager             ║')
  console.log('║  M/s Shri Bajrang Construction — 4 letters × 51 drafts  ║')
  console.log('╚══════════════════════════════════════════════════════════╝\n')

  const summary = []
  let totalGenerated = 0
  let totalFailed = 0

  for (const letter of LETTERS) {
    const letterOutDir = path.join(OUT_ROOT, letter.folder, 'ai_drafts')
    fs.mkdirSync(letterOutDir, { recursive: true })

    console.log(`\n━━━ Letter: ${letter.folder} ━━━`)
    console.log(`    Input: ${letter.subject}`)
    console.log(`    Ref#${letter.referenceNumber} | ${letter.date} | ${letter.language.toUpperCase()}`)
    console.log(`    Generating 51 drafts (26 English + 25 Hindi)...\n`)

    const letterResults = []

    // 51 runs: index 0-25 = English (26), index 26-50 = Hindi (25)
    for (let i = 0; i < 51; i++) {
      const lang = i < 26 ? 'en' : 'hi'
      const draftType = DRAFT_TYPES[i % DRAFT_TYPES.length]
      const runNum = String(i + 1).padStart(2, '0')
      const langLabel = lang === 'en' ? 'EN' : 'HI'
      const fileName = `draft_${runNum}_${langLabel}_${draftType}.txt`
      const filePath = path.join(letterOutDir, fileName)

      // Skip if already generated (resume support)
      if (fs.existsSync(filePath)) {
        console.log(`  [${runNum}/51] ✓ SKIP (exists) — ${fileName}`)
        letterResults.push({ run: i + 1, lang, type: draftType, status: 'skipped', file: fileName })
        totalGenerated++
        continue
      }

      process.stdout.write(`  [${runNum}/51] ${langLabel} ${draftType.padEnd(14)} → `)

      try {
        const draft = await generateDraft(draftType, letter, lang, i)

        const content = [
          `ROBOTIC TEST RESULT`,
          `===================`,
          `Letter  : ${letter.folder}`,
          `Run     : ${i + 1}/51`,
          `Lang    : ${lang === 'en' ? 'English' : 'Hindi'}`,
          `Type    : ${draftType}`,
          `Input   : Ref#${letter.referenceNumber} dated ${letter.date}`,
          `Subject : ${letter.subject}`,
          `Generated: ${new Date().toISOString()}`,
          ``,
          `INPUT LETTER SUMMARY:`,
          `From: ${letter.from}`,
          `To  : ${letter.to}`,
          ``,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          `AI GENERATED DRAFT:`,
          `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
          ``,
          draft,
        ].join('\n')

        fs.writeFileSync(filePath, content, 'utf8')
        console.log(`✓ saved`)
        letterResults.push({ run: i + 1, lang, type: draftType, status: 'ok', file: fileName })
        totalGenerated++

        // Rate limit: 1.5s between calls
        await sleep(1500)

      } catch (err) {
        console.log(`✗ FAILED: ${err.message}`)
        letterResults.push({ run: i + 1, lang, type: draftType, status: 'failed', error: err.message })
        totalFailed++
        await sleep(3000) // longer wait on error
      }
    }

    // Write per-letter summary
    const summaryPath = path.join(letterOutDir, '_summary.json')
    fs.writeFileSync(summaryPath, JSON.stringify({
      letter: letter.folder,
      subject: letter.subject,
      referenceNumber: letter.referenceNumber,
      totalRuns: 51,
      english: 26,
      hindi: 25,
      results: letterResults,
    }, null, 2), 'utf8')

    summary.push({ letter: letter.folder, results: letterResults })
    console.log(`\n  ✓ Letter complete. Summary → ${summaryPath}`)
  }

  // ── Final report ────────────────────────────────────────────────────────────
  const reportPath = path.join(OUT_ROOT, '_robotic_test_report.json')
  fs.writeFileSync(reportPath, JSON.stringify({
    testRun: new Date().toISOString(),
    totalLetters: LETTERS.length,
    draftsPerLetter: 51,
    totalExpected: LETTERS.length * 51,
    totalGenerated,
    totalFailed,
    summary,
  }, null, 2), 'utf8')

  console.log('\n╔══════════════════════════════════════════════════════════╗')
  console.log(`║  TEST COMPLETE                                           ║`)
  console.log(`║  Generated : ${String(totalGenerated).padEnd(4)} / ${LETTERS.length * 51} drafts                        ║`)
  console.log(`║  Failed    : ${String(totalFailed).padEnd(4)}                                      ║`)
  console.log(`║  Report    : _robotic_test_report.json                   ║`)
  console.log('╚══════════════════════════════════════════════════════════╝\n')
}

run().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
