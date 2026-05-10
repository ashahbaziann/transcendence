CREATE TABLE "games" (
  "id" TEXT NOT NULL,
  "roomId" INTEGER NOT NULL,
  "winnerId" INTEGER,
  "loserId" INTEGER,
  "winnerScore" INTEGER NOT NULL DEFAULT 0,
  "loserScore" INTEGER NOT NULL DEFAULT 0,
  "duration" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'waiting',
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endedAt" TIMESTAMP,
  CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "games_roomId_key" ON "games"("roomId");