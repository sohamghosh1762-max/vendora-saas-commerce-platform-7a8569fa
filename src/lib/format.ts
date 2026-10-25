/** Format a whole rupee amount as Indian rupees, e.g. 1299 -> "₹1,299". */
export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

/** Percentage saved between original and current price, rounded up. */
export function discountPercent(current: number, original: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}
