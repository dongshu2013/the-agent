import { prisma } from "./prisma";

/**
 * Gets the latest user credits from the credits table
 * @param userId The user ID to get credits for
 * @returns The latest user credits amount
 */
export async function getUserCredits(userId: string): Promise<number> {
  const latestCredit = await prisma.credits.findFirst({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    select: { user_credits: true },
  });

  return latestCredit ? parseFloat(latestCredit.user_credits.toString()) : 0;
}

/**
 * Gets the initial credits amount for new users from the environment variable
 * @returns The initial credits amount for new users
 */
export function getInitialCredits(): number {
  const initialCredits = process.env.INITIAL_USER_CREDITS;
  return initialCredits ? parseFloat(initialCredits) : 5;
}
