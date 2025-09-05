import { PrismaClient } from '@prisma/client';

/**
 * Get user's organization ID
 * Basic function to get organization ID from user ID
 * Throws error if user not found or not associated with organization
 */
export async function getOrganizationId(prisma: PrismaClient, userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.organizationId) {
    throw new Error('User not associated with any organization');
  }

  return user.organizationId;
}
