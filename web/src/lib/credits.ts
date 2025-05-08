import { prisma } from "./prisma";

/**
 * Gets the user credits from the balances table
 * @param userId The user ID to get credits for
 * @returns The user credits amount
 */
export async function getUserCredits(userId: string): Promise<number> {
  const userBalance = await prisma.balances.findUnique({
    where: { user_id: userId },
    select: { user_credits: true },
  });

  return userBalance ? parseFloat(userBalance.user_credits.toString()) : 0;
}

/**
 * Gets the initial credits amount for new users from the environment variable
 * @returns The initial credits amount for new users
 */
export function getInitialCredits(): number {
  const initialCredits = process.env.INITIAL_USER_CREDITS;
  return initialCredits ? parseFloat(initialCredits) : 5;
}
