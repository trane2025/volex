import { createHash, randomBytes } from 'node:crypto';

import { prisma } from './prisma.js';
import { REFRESH_SESSION_MAX_AGE } from './authCookie.js';

const createRefreshToken = () => randomBytes(32).toString('base64url');
const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const readRefreshToken = (value: unknown): string | undefined =>
  typeof value === 'string' && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : undefined;

export const createRefreshSession = async (userId: number, previousToken?: string) => {
  const token = createRefreshToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + REFRESH_SESSION_MAX_AGE);

  await prisma.$transaction(async (tx) => {
    await tx.refreshSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: now } },
          ...(previousToken ? [{ tokenHash: hashToken(previousToken) }] : []),
        ],
      },
    });
    await tx.refreshSession.create({
      data: { userId, tokenHash: hashToken(token), expiresAt },
    });
  });

  return { token, expiresAt };
};

export const rotateRefreshSession = async (token: string) => {
  const tokenHash = hashToken(token);
  const nextToken = createRefreshToken();

  return prisma.$transaction(async (tx) => {
    const session = await tx.refreshSession.findUnique({ where: { tokenHash } });

    if (!session) return null;

    if (session.expiresAt <= new Date()) {
      await tx.refreshSession.delete({ where: { id: session.id } });
      return null;
    }

    const updated = await tx.refreshSession.updateMany({
      where: { id: session.id, tokenHash, expiresAt: { gt: new Date() } },
      data: { tokenHash: hashToken(nextToken) },
    });

    if (updated.count !== 1) return null;

    return { token: nextToken, userId: session.userId, expiresAt: session.expiresAt };
  });
};

export const revokeRefreshSession = async (token: string) => {
  await prisma.refreshSession.deleteMany({ where: { tokenHash: hashToken(token) } });
};
