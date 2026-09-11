import { prisma } from "@/db/client";

const DEMO_USER_EMAIL = "demo@moneyapp.local";

/**
 * Single-tenant stand-in for a real auth session. Every data-access function
 * in this app takes/derives a userId from here rather than trusting a
 * client-supplied id, so swapping this out for a real session lookup (e.g.
 * NextAuth's `getServerSession`) later is a one-function change — nothing
 * downstream needs to know the difference.
 */
export async function getCurrentUser() {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user) {
    throw new Error("Demo user not found. Run `npm run db:seed` to set up the database.");
  }
  return user;
}

export async function getCurrentUserId() {
  const user = await getCurrentUser();
  return user.id;
}

export { DEMO_USER_EMAIL };
