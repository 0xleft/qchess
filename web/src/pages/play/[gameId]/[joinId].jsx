import { useRouter } from 'next/router';
import Chessboard, { Color, Role } from '@/components/chess/Chessboard';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';

export const getServerSideProps = async ({ req, res }) => {
    return {
        props: {}
    };
};

export default function PlayID() {
    const router = useRouter();
    const { gameId, joinId } = router.query;

    const [boardState, setBoardState] = useState(null);
	const [role, setRole] = useState(Role.PLAYER);
	const [color, setColor] = useState(Color.WHITE);
	const [playing, setPlaying] = useState(false);
	const [flipped, setFlipped] = useState(false);
	const [client, setClient] = useState(null);

    if (!gameId || !joinId) {
        return <h1>Invalid URL</h1>;
    }
 
    function sendMove(move) {
		if (!client) return;
		client.send(JSON.stringify({
			'id': gameId,
			'type': 'move',
			'move': move
		}).toString());
	};

    function onMove(move) {
        if (move.promotion === undefined) {
            move.promotion = "";
		}
        boardState.move(move);
		sendMove(`${move.from}${move.to}${move.promotion}`);
		setBoardState(new Chess(boardState.fen()));
    }

    useEffect(() => {
        const client = new WebSocket('ws://localhost:2425/ws');
        setClient(client);
        client.onopen = () => {
            client.send(JSON.stringify({
                'id': gameId,
                'joinId': joinId || 'none',
                'type': 'join'
            }).toString());
        };
        client.onmessage = (message) => {
            if (JSON.parse(message.data).error) {
                console.error(JSON.parse(message.data).error);
            }

            if (JSON.parse(message.data).board) {
                setBoardState(new Chess(JSON.parse(message.data).board));
                return;
            }

            if (JSON.parse(message.data).role) {
                setRole(JSON.parse(message.data).role);
                setColor(JSON.parse(message.data).color === 'white' ? Color.WHITE : Color.BLACK);
                setFlipped(JSON.parse(message.data).color === 'black' ? true : false);
                return;
            }

            if (JSON.parse(message.data).playing) {
                setPlaying(Boolean(JSON.parse(message.data).playing));
                return;
            }
        };
    }, []);

    return (
        <>
            <h1>Play {gameId} {joinId}</h1>

            <Chessboard id={gameId} joinId={joinId} boardState={boardState} role={role} color={color} playing={playing} flipped={flipped} onMove={onMove} />
        </>
    );
}