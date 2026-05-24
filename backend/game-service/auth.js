// import jwt from 'jsonwebtoken';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export function validateToken(token) {
//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     return { id: decoded.userId, username: decoded.email };
//   } catch {
//     return null;
//   }
// }

// export async function saveMatchResult({ winnerId, loserId, winnerScore, loserScore, duration }) {
//   await prisma.game.create({
//     data: {
//       roomId: Date.now(),
//       winnerId,
//       loserId,
//       winnerScore,
//       loserScore,
//       duration,
//       status: 'done',
//       endedAt: new Date()
//     }
//   });
// }


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

async function updateUserStats(userId, outcome) {
  try {
    const column = outcome === 'win' ? 'wins' : 'losses';
    await fetch(`http://user-service:3000/users/stats/internal`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, column }),
    });
  } catch (err) {
    console.error('Failed to update user stats:', err.message);
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
      endedAt: new Date(),
    }
  });

  await Promise.all([
    updateUserStats(winnerId, 'win'),
    updateUserStats(loserId, 'loss'),
  ]);
}