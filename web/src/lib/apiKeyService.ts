import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate a random API key
export const generateApiKey = (): string => {
  return crypto.randomBytes(24).toString("hex");
};

// Get user's API key from database
export const getUserApiKey = async (userId: string): Promise<string | null> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.api_key) {
      return user.api_key;
    }

    return null;
  } catch (error) {
    console.error("Error getting user API key:", error);
    return null;
  }
};

// Create a new user with API key
export const createUserWithApiKey = async (
  userId: string,
  username: string,
  email?: string
): Promise<string | null> => {
  try {
    const newApiKey = generateApiKey();

    const user = await prisma.user.create({
      data: {
        id: userId,
        username,
        email,
        api_key: newApiKey,
      },
    });

    return user.api_key;
  } catch (error) {
    console.error("Error creating user with API key:", error);
    return null;
  }
};

// Rotate (regenerate) user's API key
export const rotateApiKey = async (userId: string): Promise<string | null> => {
  try {
    const newApiKey = generateApiKey();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { api_key: newApiKey },
    });

    return updatedUser.api_key;
  } catch (error) {
    console.error("Error rotating API key:", error);
    return null;
  }
};
