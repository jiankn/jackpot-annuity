export type PaymentTiming = 'due' | 'ordinary';
export interface AnnuityOptions {
  /** Dollar number or string, including conventional commas and K/M/B suffixes. */
  total: number | string;
  payments?: number;
  /** Decimal rate: 0.05 means 5%. Must be greater than -1 and at most 1. */
  growthRate?: number;
  /** Decimal rate between 0 and 1. */
  discountRate?: number;
  timing?: PaymentTiming;
}
export interface PaymentRow {
  payment: number;
  /** 0 for the first due payment; 1 for the first ordinary payment. */
  year: number;
  amountCents: number;
  presentValueCents: number;
}
export interface AnnuityResult {
  totalCents: number;
  payments: number;
  growthRate: number;
  discountRate: number;
  timing: PaymentTiming;
  presentValueCents: number;
  rows: PaymentRow[];
}
export function parseAmount(value: number | string): number;
export function annuitySchedule(totalCents: number, payments?: number, growthRate?: number): number[];
export function presentValue(cashFlows: number[], discountRate?: number, timing?: PaymentTiming): number;
export function calculateAnnuity(options: AnnuityOptions): AnnuityResult;
export function toCSV(result: AnnuityResult): string;
