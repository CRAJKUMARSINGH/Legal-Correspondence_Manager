import type { DraftRequest, Lang } from '../types'

const SYSTEM_PROMPT = `You are a senior Indian legal correspondence expert specializing in construction contracts, government departments, and civil engineering disputes. You draft formal legal letters with:
- Precise legal language citing relevant provisions (Contract Act, Arbitration Act, CPWD conditions)
- Firm but professional tone
- Clear demands with deadlines
- Proper escalation hierarchy (Executive Engineer → Superintending Engineer → Additional Chief Engineer → Chief Engineer)
- Both English and Hindi versions when requested
- Interest calculations under Section 73/74 of Indian Contract Act
- References to previous correspondence for continuity
Always structure letters with: Reference No., Date, Subject, Salutation, Body paragraphs, Demand/Action required, Consequences of non-compliance, Closing.`

export async function generateDraft(req: DraftRequest, apiKey: string): Promise<string> {
  const prompt = buildPrompt(req)

  // Try OpenAI-compatible endpoint (works with Emergent key too)
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
      temperature: 0.4,
      max_tokens: 2000,
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

  const caseContext = req.caseInfo
    ? `Case: ${req.caseInfo.title}, Contract No: ${req.caseInfo.contractNo ?? 'N/A'}, Work: ${req.caseInfo.workName ?? 'N/A'}, Client: ${req.caseInfo.clientName}, Department: ${req.caseInfo.department ?? 'N/A'}`
    : ''

  const prevLetter = req.originalCorrespondence
    ? `Previous correspondence dated ${req.originalCorrespondence.date}:\nSubject: ${req.originalCorrespondence.subject}\nFrom: ${req.originalCorrespondence.from} To: ${req.originalCorrespondence.to}\nContent: ${req.originalCorrespondence.body}`
    : ''

  switch (req.type) {
    case 'reminder':
      return `Draft a formal legal REMINDER letter in ${langLabel} for today's date (${today}).
${caseContext}
${prevLetter}
Requirements:
- Reference the previous letter(s) and note that no reply/action has been received
- Use stronger, more assertive legal language than the original
- Set a firm deadline (7 days) for compliance
- Warn of legal consequences including arbitration/court proceedings
- Mention damages for delay
${req.additionalContext ? `Additional instructions: ${req.additionalContext}` : ''}
Format as a complete formal letter ready to send.`

    case 'payment_demand':
      return `Draft a formal PAYMENT DEMAND letter with interest and damages in ${langLabel} for today's date (${today}).
${caseContext}
${prevLetter}
Financial details:
- Principal amount due: ₹${req.amount?.toLocaleString('en-IN') ?? '[AMOUNT]'}
- Interest rate: ${req.interestRate ?? 18}% per annum
- Days overdue: ${req.daysOverdue ?? '[DAYS]'}
- Calculated interest: ₹${req.amount && req.daysOverdue && req.interestRate ? Math.round(req.amount * req.interestRate * req.daysOverdue / 36500).toLocaleString('en-IN') : '[INTEREST]'}
Requirements:
- Cite Section 73 and 74 of Indian Contract Act for damages
- Cite relevant CPWD/PWD contract clauses for payment timelines
- Demand principal + interest + consequential damages
- Give 15-day ultimatum before arbitration/legal proceedings
- Mention that delay in payment constitutes breach of contract
${req.additionalContext ? `Additional instructions: ${req.additionalContext}` : ''}
Format as a complete formal letter ready to send.`

    case 'escalation':
      return `Draft a formal ESCALATION letter in ${langLabel} for today's date (${today}) to be sent to ${req.escalateTo ?? 'Chief Engineer'} with copies to Superintending Engineer and Additional Chief Engineer.
${caseContext}
${prevLetter}
Escalation details:
- Negligence/misconduct: ${req.negligenceDetails ?? 'Intentional non-payment and non-communication despite multiple reminders'}
- Executive Engineer has failed to respond to bills and correspondence
- This constitutes willful neglect and possible bias/mala fide intent
Requirements:
- Address to ${req.escalateTo ?? 'Chief Engineer'}
- CC: Superintending Engineer, Additional Chief Engineer
- Clearly name the Executive Engineer and document specific acts of negligence
- Use language like "intentional neglect", "willful default", "dereliction of duty", "mala fide intent"
- Demand immediate intervention, payment release, and departmental inquiry against the Executive Engineer
- Cite relevant service rules and contract provisions
- Demand action within 7 days failing which legal/RTI/court proceedings will be initiated
${req.additionalContext ? `Additional instructions: ${req.additionalContext}` : ''}
Format as a complete formal letter with proper CC list.`

    case 'fresh_notice':
      return `Draft a fresh formal LEGAL NOTICE in ${langLabel} for today's date (${today}).
${caseContext}
Requirements:
- Professional legal notice format
- Clear statement of facts and grievances
- Specific demands with timeline
- Legal consequences of non-compliance
${req.additionalContext ? `Additional instructions: ${req.additionalContext}` : ''}
Format as a complete formal legal notice.`

    default:
      return `Draft a formal legal letter in ${langLabel}. ${req.additionalContext ?? ''}`
  }
}
