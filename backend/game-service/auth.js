import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function validateToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { id: decoded.userId, username: decoded.email };
  } catch {
    return null;
  }
}

export async function saveMatchResult({ winnerId, loserId, winnerScore, loserScore, duration }) {
  await prisma.game.create({
    data: {
      roomId: Date.now(),
      winnerId,
      loserId,
      winnerScore,
      loserScore,
      duration,
      status: 'done',
      endedAt: new Date()
    }
  });
}