import { format, differenceInDays, parseISO } from 'date-fns'
import { useState, useEffect } from 'react'

export interface InterestCalculation {
  principal: number
  rate: number
  startDate: string
  endDate: string
  days: number
  simpleInterest: number
  compoundInterest: number
  totalAmount: number
  breakdown: DailyBreakdown[]
}

export interface DailyBreakdown {
  date: string
  days: number
  interest: number
  balance: number
  cumulativeInterest: number
}

export interface InterestScenario {
  name: string
  rate: number
  calculation: InterestCalculation
  color: string
}

export interface CalculationHistory {
  id: string
  caseId: string
  principal: number
  rate: number
  startDate: string
  endDate: string
  calculation: InterestCalculation
  createdAt: string
  notes?: string
}

export class InterestCalculator {
  // Simple interest calculation
  static calculateSimpleInterest(
    principal: number,
    rate: number,
    days: number
  ): number {
    return (principal * rate * days) / (365 * 100)
  }

  // Compound interest calculation (daily compounding)
  static calculateCompoundInterest(
    principal: number,
    rate: number,
    days: number
  ): number {
    const dailyRate = rate / (365 * 100)
    return principal * Math.pow(1 + dailyRate, days) - principal
  }

  // Comprehensive calculation
  static calculateInterest(
    principal: number,
    rate: number,
    startDate: string,
    endDate: string
  ): InterestCalculation {
    const start = parseISO(startDate)
    const end = parseISO(endDate)
    const days = differenceInDays(end, start)

    if (days <= 0) {
      return {
        principal,
        rate,
        startDate,
        endDate,
        days: 0,
        simpleInterest: 0,
        compoundInterest: 0,
        totalAmount: principal,
        breakdown: []
      }
    }

    const simpleInterest = this.calculateSimpleInterest(principal, rate, days)
    const compoundInterest = this.calculateCompoundInterest(principal, rate, days)
    const totalAmount = principal + compoundInterest

    // Generate breakdown
    const breakdown = this.generateBreakdown(principal, rate, start, end)

    return {
      principal,
      rate,
      startDate,
      endDate,
      days,
      simpleInterest,
      compoundInterest,
      totalAmount,
      breakdown
    }
  }

  // Generate daily/monthly breakdown
  static generateBreakdown(
    principal: number,
    rate: number,
    startDate: Date,
    endDate: Date
  ): DailyBreakdown[] {
    const breakdown: DailyBreakdown[] = []
    const dailyRate = rate / (365 * 100)
    let currentBalance = principal
    let cumulativeInterest = 0

    // Generate monthly breakdown for better performance
    let currentDate = new Date(startDate)
    
    while (currentDate < endDate) {
      const nextMonth = new Date(currentDate)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      if (nextMonth > endDate) {
        nextMonth.setTime(endDate.getTime())
      }

      const days = differenceInDays(nextMonth, currentDate)
      const interest = currentBalance * dailyRate * days
      currentBalance += interest
      cumulativeInterest += interest

      breakdown.push({
        date: format(currentDate, 'yyyy-MM-dd'),
        days,
        interest,
        balance: currentBalance,
        cumulativeInterest
      })

      currentDate = nextMonth
    }

    return breakdown
  }

  // Calculate multiple scenarios
  static calculateScenarios(
    principal: number,
    startDate: string,
    endDate: string,
    rates: { name: string; rate: number; color?: string }[]
  ): InterestScenario[] {
    return rates.map(({ name, rate, color = '#3b82f6' }) => ({
      name,
      rate,
      calculation: this.calculateInterest(principal, rate, startDate, endDate),
      color
    }))
  }

  // Common interest rates for legal cases
  static getCommonRates(): { name: string; rate: number; description: string }[] {
    return [
      { name: 'RBI Bank Rate', rate: 6.5, description: 'Current RBI bank rate' },
      { name: '18% p.a.', rate: 18, description: 'Standard commercial rate' },
      { name: '24% p.a.', rate: 24, description: 'High commercial rate' },
      { name: '36% p.a.', rate: 36, description: 'Maximum commercial rate' },
      { name: '6% Simple', rate: 6, description: 'Simple interest rate' },
      { name: '9% Simple', rate: 9, description: 'Court awarded simple interest' },
      { name: '12% Simple', rate: 12, description: 'Standard legal interest' },
      { name: '15% Simple', rate: 15, description: 'Enhanced legal interest' }
    ]
  }

  // Format currency
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Format rate
  static formatRate(rate: number): string {
    return `${rate.toFixed(2)}% p.a.`
  }

  // Export calculation to CSV
  static exportToCSV(calculation: InterestCalculation): string {
    const headers = [
      'Date', 'Days', 'Interest', 'Balance', 'Cumulative Interest'
    ]
    
    const rows = calculation.breakdown.map(item => [
      item.date,
      item.days.toString(),
      this.formatCurrency(item.interest),
      this.formatCurrency(item.balance),
      this.formatCurrency(item.cumulativeInterest)
    ])
    
    const summary = [
      '',
      '',
      '',
      '',
      '',
      'Summary',
      '',
      '',
      '',
      '',
      `Principal,${this.formatCurrency(calculation.principal)}`,
      `Rate,${this.formatRate(calculation.rate)}`,
      `Days,${calculation.days}`,
      `Simple Interest,${this.formatCurrency(calculation.simpleInterest)}`,
      `Compound Interest,${this.formatCurrency(calculation.compoundInterest)}`,
      `Total Amount,${this.formatCurrency(calculation.totalAmount)}`
    ]
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      ...summary
    ].join('\n')
  }

  // Generate calculation report
  static generateReport(calculation: InterestCalculation): string {
    return `
INTEREST CALCULATION REPORT
==========================

Principal Amount: ${this.formatCurrency(calculation.principal)}
Interest Rate: ${this.formatRate(calculation.rate)}
Period: ${calculation.startDate} to ${calculation.endDate}
Total Days: ${calculation.days}

CALCULATION DETAILS
-------------------
Simple Interest: ${this.formatCurrency(calculation.simpleInterest)}
Compound Interest: ${this.formatCurrency(calculation.compoundInterest)}
Total Amount: ${this.formatCurrency(calculation.totalAmount)}

MONTHLY BREAKDOWN
-----------------
${calculation.breakdown.map(item => 
  `${item.date}: ${item.days} days, Interest: ${this.formatCurrency(item.interest)}, Balance: ${this.formatCurrency(item.balance)}`
).join('\n')}

Generated on: ${format(new Date(), 'PPP')}
    `.trim()
  }

  // Validate calculation inputs
  static validateInputs(
    principal: number,
    rate: number,
    startDate: string,
    endDate: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (principal <= 0) {
      errors.push('Principal amount must be greater than 0')
    }

    if (rate < 0) {
      errors.push('Interest rate cannot be negative')
    }

    if (rate > 100) {
      errors.push('Interest rate seems unusually high')
    }

    const start = parseISO(startDate)
    const end = parseISO(endDate)

    if (isNaN(start.getTime())) {
      errors.push('Invalid start date')
    }

    if (isNaN(end.getTime())) {
      errors.push('Invalid end date')
    }

    if (start >= end) {
      errors.push('End date must be after start date')
    }

    if (differenceInDays(end, start) > 365 * 50) {
      errors.push('Period exceeds 50 years')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Calculate interest for multiple periods with different rates
  static calculateVariableRateInterest(
    principal: number,
    periods: Array<{
      rate: number
      startDate: string
      endDate: string
    }>
  ): InterestCalculation {
    let currentPrincipal = principal
    let totalSimpleInterest = 0
    let totalCompoundInterest = 0
    const allBreakdowns: DailyBreakdown[] = []

    periods.forEach((period, index) => {
      const calculation = this.calculateInterest(
        currentPrincipal,
        period.rate,
        period.startDate,
        period.endDate
      )

      totalSimpleInterest += calculation.simpleInterest
      totalCompoundInterest += calculation.compoundInterest
      currentPrincipal = calculation.totalAmount

      // Adjust breakdown balances to be cumulative
      const adjustedBreakdown = calculation.breakdown.map(item => ({
        ...item,
        balance: currentPrincipal,
        cumulativeInterest: totalSimpleInterest + (totalCompoundInterest - calculation.compoundInterest) + item.cumulativeInterest
      }))

      allBreakdowns.push(...adjustedBreakdown)
    })

    const firstPeriod = periods[0]
    const lastPeriod = periods[periods.length - 1]
    const totalDays = differenceInDays(parseISO(lastPeriod.endDate), parseISO(firstPeriod.startDate))

    return {
      principal,
      rate: 0, // Variable rate
      startDate: firstPeriod.startDate,
      endDate: lastPeriod.endDate,
      days: totalDays,
      simpleInterest: totalSimpleInterest,
      compoundInterest: totalCompoundInterest,
      totalAmount: principal + totalCompoundInterest,
      breakdown: allBreakdowns
    }
  }

  // Estimate interest rate from target amount
  static estimateRate(
    principal: number,
    targetAmount: number,
    startDate: string,
    endDate: string
  ): number {
    const days = differenceInDays(parseISO(endDate), parseISO(startDate))
    if (days <= 0 || principal <= 0) return 0

    // Using compound interest formula: A = P(1 + r)^n
    // Solving for r: r = (A/P)^(1/n) - 1
    const targetRatio = targetAmount / principal
    const dailyRate = Math.pow(targetRatio, 1 / days) - 1
    const annualRate = dailyRate * 365 * 100

    return Math.max(0, annualRate)
  }

  // Calculate time to reach target amount
  static calculateTimeToTarget(
    principal: number,
    rate: number,
    targetAmount: number
  ): number {
    if (principal <= 0 || rate <= 0 || targetAmount <= principal) return 0

    const dailyRate = rate / (365 * 100)
    const targetRatio = targetAmount / principal
    
    // Using compound interest formula: A = P(1 + r)^n
    // Solving for n: n = ln(A/P) / ln(1 + r)
    const days = Math.log(targetRatio) / Math.log(1 + dailyRate)
    
    return Math.max(0, Math.ceil(days))
  }
}

// React hook for real-time calculations
export function useInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(0)
  const [rate, setRate] = useState<number>(18)
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [calculation, setCalculation] = useState<InterestCalculation | null>(null)
  const [scenarios, setScenarios] = useState<InterestScenario[]>([])

  // Real-time calculation
  useEffect(() => {
    if (principal > 0 && rate >= 0 && startDate && endDate) {
      const validation = InterestCalculator.validateInputs(principal, rate, startDate, endDate)
      if (validation.isValid) {
        const calc = InterestCalculator.calculateInterest(principal, rate, startDate, endDate)
        setCalculation(calc)

        // Calculate scenarios
        const commonRates = InterestCalculator.getCommonRates()
        const scenarioRates = commonRates.slice(0, 4).map(r => ({
          name: r.name,
          rate: r.rate,
          color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][commonRates.indexOf(r)]
        }))
        
        const scenarioCalculations = InterestCalculator.calculateScenarios(
          principal,
          startDate,
          endDate,
          scenarioRates
        )
        setScenarios(scenarioCalculations)
      } else {
        setCalculation(null)
        setScenarios([])
      }
    } else {
      setCalculation(null)
      setScenarios([])
    }
  }, [principal, rate, startDate, endDate])

  return {
    principal,
    setPrincipal,
    rate,
    setRate,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    calculation,
    scenarios,
    formatCurrency: InterestCalculator.formatCurrency,
    formatRate: InterestCalculator.formatRate,
    validateInputs: (p: number, r: number, start: string, end: string) => 
      InterestCalculator.validateInputs(p, r, start, end),
    exportToCSV: (calc: InterestCalculation) => InterestCalculator.exportToCSV(calc),
    generateReport: (calc: InterestCalculation) => InterestCalculator.generateReport(calc),
    commonRates: InterestCalculator.getCommonRates()
  }
}
