-- CreateEnum
CREATE TYPE "Winner" AS ENUM ('WHITE', 'BLACK', 'DRAW');

-- CreateTable
CREATE TABLE "ChessGame" (
    "moves" TEXT[],
    "gameId" TEXT NOT NULL,
    "winner" "Winner" NOT NULL,
    "playedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChessGame_pkey" PRIMARY KEY ("gameId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChessGame_gameId_key" ON "ChessGame"("gameId");
