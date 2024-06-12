import prisma from "@/lib/prisma";
import axios from "axios";

export default async function handler(req, res) {
    const { page } = req.query;

    try {
        const games = await prisma.chessGame.findMany({
            take: 10,
            skip: parseInt(page) * 10,
            orderBy: {
                playedAt: 'desc'
            }
        });
        return res.status(200).json(games);
    } catch (error) {
        console.log(error);

        return res.status(500).json({ error: process.env.NODE_ENV === "development" ? error : "An error occurred" });
    }
    
    return res.status(500).json({ error: "An error occurred" });
}