// Currency formatting for Off Track — all prices are in Egyptian Pounds (EGP).

/** Format a number as an Egyptian Pound price, e.g. "1,250 EGP". */
export function formatPrice(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  const amount = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(n);
  return `${amount} EGP`;
}
