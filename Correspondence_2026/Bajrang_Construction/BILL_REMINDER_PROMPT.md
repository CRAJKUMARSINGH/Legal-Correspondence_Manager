# BILL REMINDER & PAYMENT DEMAND PROMPT
## Legal Correspondence Manager — PWD Running Bill Letters
## Client: M/s Shri Bajrang Construction | Contract: AR/2023-24/1-D
## Last Updated: 10.04.2026

---

## ⚠️ CRITICAL RULES — READ BEFORE DRAFTING

### Rule 1 — Bills are CUMULATIVE
PWD Running Bills are cumulative. Each bill's gross amount includes ALL previous
work done. Do NOT treat each bill as a fresh independent claim.

### Rule 2 — Net Due = Cumulative Gross − Amount Received till that bill date
```
Net Due (Bill N) = Gross Amount of Bill N − Total Amount Received till Bill N date
```
The "Amount Received" figure may be the same across all bills if only one payment
was made. Use the actual received figure at each bill's submission date.

### Rule 3 — Interest is period-wise on RUNNING NET OUTSTANDING
Do NOT calculate interest on incremental amounts. Calculate on the full net due
for the period each bill was the latest outstanding bill:

```
Bill 1 interest: Net Due (Bill 1) × 18% ÷ 365 × days from Due Date(1) to Due Date(2)
Bill 2 interest: Net Due (Bill 2) × 18% ÷ 365 × days from Due Date(2) to Due Date(3)
Bill 3 interest: Net Due (Bill 3) × 18% ÷ 365 × days from Due Date(3) to Due Date(4)
Bill N interest: Net Due (Bill N) × 18% ÷ 365 × days from Due Date(N) to Letter Date
```

Due Date = Bill Submission Date + 1 month (as per PWD agreement)

### Rule 4 — Two letters always generated as a pair
- Letter 1 (Forwarding): submits current bill, shows total payable including interest
  with cross-reference to Letter 2 for interest workings
- Letter 2 (Demand): detailed interest table + legal demand + consequences

### Rule 5 — Letter 1 must reference Letter 2 for interest
The forwarding letter must show:
```
(i)   Net Amount of Current Bill (no interest — being submitted today)
(ii)  Net Outstanding on Previous Bills (latest cumulative net)
(iii) Interest Accrued @ 18% p.a. (as per Letter No. [X] dated [date])
      ─────────────────────────────────────────────────────────────────
      TOTAL AMOUNT PAYABLE IMMEDIATELY
```

---

## INPUT DATA REQUIRED (fill before use)

```
Contract No     : AR/2023-24/1-D  (update if different)
Work Name       : Construction of Amli Fala Bridge and Kherveda Nai Basti to
                  Veeri Border via Kunjiya Vali Mata Road
Client          : M/s Shri Bajrang Construction, AA Class PWD Contractor
                  Padli Gujreshwar, Distt. Dungarpur (Raj.)
To              : Executive Engineer, PWD Division, Baneshwar Dham
CC              : 1. Superintending Engineer, PWD Baneshwar Dham
                  2. Additional Chief Engineer, PWD Circle Banswada
Letter Date     : DD.MM.YYYY
Interest Rate   : 18% p.a. (default — change only if contract specifies different)
Payment Due     : Letter Date + 15 days (for demand) | Bill Date + 1 month (for current bill)

Letter 1 No.    : SBC/PWD/[YEAR]/[SEQ]
Letter 2 No.    : SBC/PWD/[YEAR]/[SEQ+1]

Previous Bills (cumulative — fill all):
  Bill 1: Date DD-MM-YYYY | Gross ₹ ________ | Amt Received ₹ ________
  Bill 2: Date DD-MM-YYYY | Gross ₹ ________ | Amt Received ₹ ________
  Bill 3: Date DD-MM-YYYY | Gross ₹ ________ | Amt Received ₹ ________
  Bill 4: Date DD-MM-YYYY | Gross ₹ ________ | Amt Received ₹ ________
  (add more rows as needed)

Current Bill (being submitted today — no interest):
  Date: DD-MM-YYYY | Gross ₹ ________
  Net = Current Gross − Previous Bill Gross (NOT − total received)
```

---

## INTEREST TABLE FORMAT (Letter 2)

Columns in order:
| Bill No. | Bill Date | Cumulative Gross (₹) | Amt Received till Bill Date (₹) | Net Due (₹) | Due Date | Interest Period To | Days | Interest @ 18% p.a. (₹) |

Total row: show Net Outstanding (latest bill's net due) + Total Interest separately.

---

## SUMMARY BOX FORMAT (both letters)

```
(A) Net Outstanding Principal (Bill N — latest cumulative net)  :  ₹ ___________
(B) Total Interest Accrued @ 18% p.a. (period-wise)            :  ₹ ___________
(C) Net Amount of Current Bill (no interest — submitted today)  :  ₹ ___________
    ─────────────────────────────────────────────────────────────────────────────
    GRAND TOTAL CLAIMED / PAYABLE IMMEDIATELY (A + B + C)       :  ₹ ___________
```

Note: (C) = Current Bill Gross − Previous Bill Gross (NOT − total received)

---

## LEGAL CITATIONS (always include in Letter 2)

- Section 73, Indian Contract Act 1872 — compensation for loss/damage from breach
- Section 74, Indian Contract Act 1872 — liquidated damages
- Arbitration & Conciliation Act 1996 — arbitration clause invocation
- PWD/CPWD General Conditions of Contract — payment within 30 days of bill submission
- Government Servant Conduct Rules — dereliction of duty by officers

---

## CONSEQUENCES OF NON-COMPLIANCE (Letter 2 — always include)

If dues not cleared within 15 days:
1. Arbitration proceedings under Arbitration & Conciliation Act 1996
2. Complaint to Vigilance Department / Anti-Corruption Bureau
3. RTI Application for reasons of deliberate delay
4. Suspension of work at site under contract terms
5. Claim for additional consequential damages under Section 73, ICA 1872

---

## PDF GENERATION RULES

Script: `node scripts/generate_pdf.mjs`

- Format: A4, Times New Roman 12pt
- Margins: top 20mm, bottom 20mm, left 25mm, right 20mm
- puppeteer setting: `preferCSSPageSize: false` — prevents CSS shrink
- Tables: `border-collapse: collapse`, fixed pixel/pt widths, no % column widths
- Header bar: firm name in #1e3570 blue, 3px top border + 1px bottom border
- Subject: centered, bold, underlined, 12pt
- Interest table header: background #1e3570, white text, 9.5pt
- Grand total row: background #1e3570, white text, 11pt bold
- If PDF file is open/locked: save to new filename (append _v2, _v3 etc.)
- Devanagari text: use Noto Sans Devanagari (Google Fonts or local)

---

## REFERENCE — BAJRANG CASE LETTER LOG (update as letters are sent)

| Letter No.        | Date       | Subject                                           |
|-------------------|------------|---------------------------------------------------|
| AR/2023-24/1-D    | 17.07.2023 | Work Commencement Order (received from PWD)       |
| 237               | 10.07.2025 | Payment request — first letter                    |
| 337               | 15.10.2025 | Complaint — pending payment ₹2.19 Cr              |
| 1133              | 19.11.2025 | Forest clearance NOC / hindrance register         |
| JJ 32             | 20.11.2025 | Objection to work withdrawal proposal             |
| SBC/PWD/2026/05   | 10.04.2026 | Bill No. 5 forwarding (Gross ₹4,27,95,925)        |
| SBC/PWD/2026/06   | 10.04.2026 | Payment demand with interest table                |

---

## ACTUAL FIGURES — BAJRANG CASE (10.04.2026)

| Bill | Date       | Cumulative Gross | Amt Received | Net Due     | Due Date   | Period To  | Days | Interest   |
|------|------------|-----------------|--------------|-------------|------------|------------|------|------------|
| 1    | 18-05-2025 | 2,92,56,780     | 1,85,62,332  | 1,06,94,448 | 18-06-2025 | 19-12-2025 | 184  | 9,70,411   |
| 2    | 19-11-2025 | 3,48,82,632     | 1,85,62,332  | 1,63,20,300 | 19-12-2025 | 22-01-2026 | 34   | 2,73,644   |
| 3    | 22-12-2025 | 3,77,38,957     | 1,85,62,332  | 1,91,76,625 | 22-01-2026 | 18-02-2026 | 27   | 2,55,338   |
| 4    | 18-01-2026 | 4,05,95,188     | 1,85,62,332  | 2,20,32,856 | 18-02-2026 | 10-04-2026 | 51   | 5,54,141   |
|      |            |                 |              |             |            | **TOTAL**  |      | **20,53,534** |

Net Outstanding (Bill 4)    : ₹ 2,20,32,856
Total Interest              : ₹    20,53,534
Current Bill 5 Net          : ₹    22,00,737  (₹4,27,95,925 − ₹4,05,95,188)
**GRAND TOTAL               : ₹ 2,62,87,127**

---

*Prompt saved: 10.04.2026 | Verified and corrected after actual drafting*
*Key correction: interest is period-wise on running net outstanding, NOT on incremental amounts*
