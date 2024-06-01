import * as React from 'react';
import { useRouter } from 'next/router';
import Chessboard from '@/components/chess/PlayChessboard';
import { Button } from '@mui/material';

export const getServerSideProps = async ({ req, res }) => {
    return {
        props: {}
    };
};

export default function PlayID() {
    const router = useRouter();
    const { gameId, joinId } = router.query;

    if (!gameId || !joinId) {
        return <h1>Invalid URL</h1>;
    }

    return (
        <>
            <h1>Play {gameId} {joinId}</h1>

            <Chessboard id={gameId} joinId={joinId} />
        </>
    );
}