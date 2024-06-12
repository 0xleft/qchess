import * as React from 'react';
import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';

export async function getServerSideProps({ params }) {

    const { id } = params;

    const data = await prisma.chessGame.findUnique({
        where: {
            gameId: id,
        },
    });

    if (!data) {
        return {
            notFound: true,
        };
    }

    return {
        props: {
            game: {
                winner: data.winner,
                moves: data.moves,
                gameId: data.gameId,
                playedAt: data.playedAt,
            }
        },
    };
}

export default function ExploreID() {
    const router = useRouter();
    const { id } = router.query;

    return (
        <>

        </>
    );
}