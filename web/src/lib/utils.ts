/**
 * Format credit amount by dividing by 1,000,000 and displaying with 2 decimal places
 * @param credits Number of credits in raw form
 * @returns Formatted credit value as string with 2 decimal places
 */
export const formatCredits = (credits: number | null | undefined, precision = 2): string => {
  if (credits === null || credits === undefined) return '0.00';
  return (credits / 1000000).toFixed(precision);
};
