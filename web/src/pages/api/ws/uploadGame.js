import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        gameId,
        winner,
        moves,
        playedAt,
    } = JSON.parse(req.body);

    if (!gameId || !winner || !moves || !playedAt) {
        return res.status(400).json({ error: "Invalid request" });
    }

    try {
        prisma.chessGame.create({
            data: {
                gameId,
                winner,
                moves,
                playedAt,
            },
        });

        console.log("Game uploaded");
    } catch (error) {
        return res.status(500).json({ error: process.env.NODE_ENV === "development" ? error : "An error occurred" });
    }

	return res.status(500).json({ error: "An error occurred" });
}