'use client'
import { useMemo } from 'react'

const EXCHANGE_FEE_PCT  = 0.015
const CASH_TOP_UP_MAX   = 0.25

export interface ExchangeCalc {
  valueA:       number
  valueB:       number
  cashTopUp:    number
  feeTotal:     number
  feeA:         number   // your share
  feeB:         number   // their share
  maxCashTopUp: number
  cashOk:       boolean
  isBalanced:   boolean
  suggestedQtyB: number  // how many hrs/sessions the other party owes
}

export function useExchangeCalc(opts: {
  rateA:    number
  rateB:    number
  qtyA:     number
  cashTopUp?: number
}): ExchangeCalc {
  const { rateA, rateB, qtyA, cashTopUp = 0 } = opts

  return useMemo(() => {
    const valueA       = +(rateA * qtyA).toFixed(2)
    const suggestedQtyB = rateB > 0 ? +(valueA / rateB).toFixed(2) : 0
    const valueB       = +(rateB * Math.floor(suggestedQtyB)).toFixed(2)
    const maxCashTopUp = +(valueA * CASH_TOP_UP_MAX).toFixed(2)
    const cashOk       = cashTopUp <= maxCashTopUp
    const total        = valueA + valueB + cashTopUp
    const feeTotal     = +(total * EXCHANGE_FEE_PCT).toFixed(4)
    const feeA         = +(feeTotal / 2).toFixed(4)
    const feeB         = feeA
    const isBalanced   = Math.abs(valueA - valueB) < 0.01

    return { valueA, valueB, cashTopUp, feeTotal, feeA, feeB, maxCashTopUp, cashOk, isBalanced, suggestedQtyB }
  }, [rateA, rateB, qtyA, cashTopUp])
}
