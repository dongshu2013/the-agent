/**
 * Format currency amount by dividing by 1,000,000 and displaying with appropriate decimal places
 * @param amount Number amount in raw form (in millionths)
 * @param options Formatting options
 * @returns Formatted currency value as string
 */
export const formatCurrency = (
  amount: number | null | undefined,
  options: {
    currency?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
): string => {
  if (amount === null || amount === undefined) return '$0.00';

  const { currency = 'USD', minimumFractionDigits = 2, maximumFractionDigits = 6 } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount / 1_000_000);
};
