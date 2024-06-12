import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(req, res) {

    // todo make only internal

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        gameId,
        winner,
        moves,
        playedAt,
    } = req.body;

    console.log(gameId, winner, moves, playedAt);

    if (!gameId || !winner || !moves || !playedAt) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        await prisma.chessGame.create({
            data: {
                gameId: gameId,
                winner: winner.toUpperCase(),
                moves: moves.split(","),
                playedAt: new Date(playedAt),
            },
        });

        console.log("Game uploaded");

        return res.status(200).json({ message: "Game uploaded" });
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: process.env.NODE_ENV === "development" ? error : "An error occurred" });
    }

	return res.status(500).json({ error: "An error occurred" });
}