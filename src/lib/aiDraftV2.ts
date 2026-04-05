import type { DraftRequest } from '../types'

const SYSTEM_PROMPT = `You are a senior Indian legal correspondence expert specializing in PWD/CPWD construction contracts, government departments, and civil engineering disputes in Rajasthan. You draft formal legal letters with:
- Precise legal language citing relevant provisions (Indian Contract Act Sections 55, 73, 74; Arbitration & Conciliation Act 1996; CPWD/PWD General Conditions of Contract)
- Firm but professional tone — assertive without being aggressive
- Clear demands with specific deadlines (7 days for reminders, 15 days for payment demands)
- Proper PWD escalation hierarchy: Executive Engineer → Superintending Engineer → Additional Chief Engineer → Chief Engineer
- Interest calculations under Section 73/74 of Indian Contract Act at 18% per annum
- References to ALL previous correspondence for continuity (cite letter numbers and dates)
- Both English and Hindi versions when requested
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

export async function generateDraftV2(req: DraftRequest, apiKey: string): Promise<string> {
  const prompt = buildPrompt(req)

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
      temperature: 0.35,
      max_tokens: 2500,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `API error ${response.status}`)
  }

  const data = await response.json() as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}

function buildPrompt(req: DraftRequest): string {
  const langLabel = req.lang === 'hi' ? 'Hindi (Devanagari script)' : 'English'
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })

  // Rich case context
  const caseCtx = req.caseInfo ? [
    `Case: ${req.caseInfo.title}`,
    `Contract No: ${req.caseInfo.contractNo ?? 'N/A'}`,
    `Work: ${req.caseInfo.workName ?? 'N/A'}`,
    `Client/Contractor: ${req.caseInfo.clientName}${req.caseInfo.clientDesignation ? ` (${req.caseInfo.clientDesignation})` : ''}`,
    `Department: ${req.caseInfo.department ?? 'N/A'}`,
    req.caseInfo.description ? `Background: ${req.caseInfo.description}` : '',
    req.caseInfo.opposingParties?.length
      ? `Opposing Officers:\n${req.caseInfo.opposingParties.map(p => `  - ${p.name}, ${p.designation}, ${p.department}`).join('\n')}`
      : '',
  ].filter(Boolean).join('\n') : ''

  // Full letter chain for context
  const chainCtx = req.letterChain?.length
    ? `\nCORRESPONDENCE HISTORY (chronological):\n${req.letterChain.map((l, i) =>
        `[${i + 1}] Ref#${l.referenceNumber ?? 'N/A'} dated ${l.date}\n  From: ${l.from}\n  To: ${l.to}\n  Subject: ${l.subject}\n  Content: ${(l.body || (l.body_hi ?? '')).slice(0, 400)}${(l.body || (l.body_hi ?? '')).length > 400 ? '...' : ''}`
      ).join('\n\n')}`
    : req.originalCorrespondence
    ? `\nPREVIOUS LETTER:\nRef#${req.originalCorrespondence.referenceNumber ?? 'N/A'} dated ${req.originalCorrespondence.date}\nFrom: ${req.originalCorrespondence.from}\nTo: ${req.originalCorrespondence.to}\nSubject: ${req.originalCorrespondence.subject}\nContent: ${(req.originalCorrespondence.body || (req.originalCorrespondence.body_hi ?? '')).slice(0, 600)}`
    : ''

  const interest = req.amount && req.daysOverdue && req.interestRate
    ? Math.round(req.amount * req.interestRate * req.daysOverdue / 36500)
    : null

  switch (req.type) {
    case 'reminder':
      return `Draft a formal legal REMINDER letter in ${langLabel} dated ${today}.

${caseCtx}
${chainCtx}

REQUIREMENTS:
- This is a REMINDER — previous letter(s) sent but NO reply or action received
- Reference ALL previous letters by number and date
- Use assertive legal language: "despite repeated requests", "willful non-compliance", "dereliction of duty"
- Set firm 7-day deadline for compliance
- Warn: failure will result in arbitration under Arbitration & Conciliation Act 1996, plus claim for damages under Section 73/74 Indian Contract Act
- If payment is involved: mention ₹${req.amount?.toLocaleString('en-IN') ?? '[AMOUNT]'} pending since [date], accruing interest @${req.interestRate ?? 18}% p.a.
${req.additionalContext ? `\nADDITIONAL INSTRUCTIONS: ${req.additionalContext}` : ''}

Write the complete letter ready to print and send.`

    case 'payment_demand':
      return `Draft a formal PAYMENT DEMAND letter with interest and damages in ${langLabel} dated ${today}.

${caseCtx}
${chainCtx}

FINANCIAL DETAILS:
- Principal amount due: ₹${req.amount?.toLocaleString('en-IN') ?? '[AMOUNT]'}
- Interest rate: ${req.interestRate ?? 18}% per annum
- Days overdue: ${req.daysOverdue ?? '[DAYS]'}
- Calculated interest: ₹${interest?.toLocaleString('en-IN') ?? '[INTEREST]'}
- TOTAL CLAIM: ₹${interest && req.amount ? (req.amount + interest).toLocaleString('en-IN') : '[TOTAL]'}

REQUIREMENTS:
- Cite Section 73 and 74 of Indian Contract Act for damages
- Cite PWD/CPWD contract clause for payment within 30 days of bill submission
- Demand: principal + interest + consequential damages (work stoppage losses)
- Give 15-day ultimatum
- State: non-payment = breach of contract → arbitration proceedings will be initiated
- Mention: contractor reserves right to suspend work under contract clause
${req.additionalContext ? `\nADDITIONAL INSTRUCTIONS: ${req.additionalContext}` : ''}

Write the complete letter ready to print and send.`

    case 'escalation':
      return `Draft a formal ESCALATION letter in ${langLabel} dated ${today}.

${caseCtx}
${chainCtx}

ESCALATION TARGET: ${req.escalateTo ?? 'Chief Engineer'}
CC: Superintending Engineer, Additional Chief Engineer (copy to all senior officers)

NEGLIGENCE/MISCONDUCT TO DOCUMENT:
${req.negligenceDetails ?? 'Executive Engineer has intentionally failed to process running bills, respond to correspondence, and take any action despite multiple written reminders — constituting willful neglect, dereliction of duty, and possible mala fide intent.'}

REQUIREMENTS:
- Address to ${req.escalateTo ?? 'Chief Engineer'} with CC to SE and ACE
- Name the Executive Engineer specifically and document each act of negligence with dates
- Use strong language: "intentional neglect", "willful default", "dereliction of duty", "mala fide intent", "gross misconduct"
- Demand: (1) immediate intervention, (2) release of pending payment within 7 days, (3) departmental inquiry/show-cause notice against Executive Engineer
- Cite: PWD Service Rules, Government Servant Conduct Rules
- Warn: if no action in 7 days → RTI application, complaint to Vigilance Department, and legal proceedings
${req.additionalContext ? `\nADDITIONAL INSTRUCTIONS: ${req.additionalContext}` : ''}

Write the complete letter with proper CC list, ready to print and send.`

    case 'improve':
      return `Improve the following legal draft in ${langLabel} dated ${today}.
 
${caseCtx}
${chainCtx}

ORIGINAL DRAFT TO IMPROVE:
${req.originalCorrespondence?.body || req.originalCorrespondence?.body_hi || '[DRAFT CONTENT]'}

REQUIREMENTS:
- Polished, more professional, and firm legal tone
- Standardize the structure and formatting according to PWD/CPWD legal practice
- Ensure proper legal citations (Indian Contract Act, etc.) are included or strengthened
- Remove any ambiguity or passive language
- Keep the original intent and core facts exactly as stated
- Use assertive phrases: "this is to reiterate", "failure to address", "material breach"
${req.additionalContext ? `\nADDITIONAL INSTRUCTIONS: ${req.additionalContext}` : ''}

Write the complete IMPROVED letter ready to print and send.`

    case 'fresh_notice':
      return `Draft a fresh formal LEGAL NOTICE in ${langLabel} dated ${today}.

${caseCtx}
${chainCtx}

REQUIREMENTS:
- Professional legal notice format
- Clear chronological statement of facts and grievances
- Specific demands with timeline
- Legal consequences of non-compliance (arbitration, court proceedings, damages)
${req.additionalContext ? `\nADDITIONAL INSTRUCTIONS: ${req.additionalContext}` : ''}

Write the complete legal notice ready to print and send.`

    default:
      return `Draft a formal legal letter in ${langLabel} dated ${today}.\n${caseCtx}\n${chainCtx}\n${req.additionalContext ?? ''}`
  }
}
