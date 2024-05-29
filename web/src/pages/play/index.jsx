import Chessboard from '@/components/chess/Chessboard';
import { Button } from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

export default function PlayIndex() {
    const router = useRouter();

    const [blackId, setBlackId] = React.useState(null);
    const [gameId, setGameId] = React.useState(null);
    const [whiteId, setWhiteId] = React.useState(null);

    return (
        <>
            <Button onClick={async () => {
                fetch('http://localhost:2425/ws/create?random=true').then(response => response.json()).then(data => {
                    setGameId(data.id);
                    setWhiteId(data.whiteId);
                    setBlackId(data.blackId);
                }).catch(console.error);
            }}>
                Create Game
            </Button>

            <Link href={`/play/${gameId}/${whiteId}`}>
                <Button>
                    Play as White
                </Button>
            </Link>

            <Link href={`/play/${gameId}/${blackId}`}>
                <Button>
                    Play as Black
                </Button>
            </Link>
        </>
    )
}