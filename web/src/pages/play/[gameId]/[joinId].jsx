import { useRouter } from 'next/router';
import Chessboard, { Color, Role } from '@/components/chess/Chessboard';
import { Button, Container, Hidden } from '@mui/material';
import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Clock from '@/components/chess/Clock';

export const getServerSideProps = async ({ req, res }) => {
    return {
        props: {}
    };
};

export default function PlayID() {
    const router = useRouter();
    const { gameId, joinId } = router.query;

    const [boardState, setBoardState] = useState(new Chess());
	const [role, setRole] = useState(Role.PLAYER);
	const [color, setColor] = useState(Color.WHITE);
	const [playing, setPlaying] = useState(false);
	const [flipped, setFlipped] = useState(false);
	const [client, setClient] = useState(null);

    const [increments, setIncrements] = useState(5);

    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);

    let reconnectAttempt = 0;

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

        if (color === Color.WHITE) {
            setWhiteTime(whiteTime + increments);
        } else {
            setBlackTime(blackTime + increments);
        }
    }

    function connectToGame() {
        const client = new WebSocket('ws://localhost:2425/ws');
        setClient(client);
        let reconnectId = null;
        try {
            reconnectId = JSON.parse(localStorage.getItem(gameId))[joinId];
        } catch {}
        client.onopen = () => {
            client.send(JSON.stringify({
                'id': gameId,
                'joinId': joinId || 'none',
                'type': 'join',
                'reconnectId': reconnectId || 'none'
            }).toString());
        };
        client.onclose = () => {
            if (reconnectAttempt > 5) {
                return;
            }
            reconnectAttempt++;
            connectToGame();
        };
        client.onmessage = (message) => {
            if (JSON.parse(message.data).error) {
                console.error(JSON.parse(message.data).error);
            }

            if (JSON.parse(message.data).increment) {
                setIncrements(parseInt(JSON.parse(message.data).increment));
            }

            if (JSON.parse(message.data).reconnectId) {
                const saveObject = localStorage.getItem(gameId) ? JSON.parse(localStorage.getItem(gameId)) : {};
                saveObject[joinId] = JSON.parse(message.data).reconnectId;
                localStorage.setItem(gameId, JSON.stringify(saveObject));
            }

            if (JSON.parse(message.data).whiteTime) {
                setWhiteTime(parseInt(JSON.parse(message.data).whiteTime));
            };

            if (JSON.parse(message.data).blackTime) {
                setBlackTime(parseInt(JSON.parse(message.data).blackTime));
            };

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
    }

    useEffect(() => {
        connectToGame();
    }, []);

    return (
        <>
            <Hidden mdDown>
                <Container className='flex flex-row'>
                    <Chessboard id={gameId} joinId={joinId} boardState={boardState} role={role} color={color} playing={playing} flipped={flipped} onMove={onMove} />
                    <div className='w-full flex flex-col justify-between'>
                        <Clock time={color === Color.BLACK ? whiteTime : blackTime} color={color === Color.BLACK ? 'white' : 'black'} dimmed={color === Color.BLACK ? boardState.turn() === 'b' : boardState.turn() === 'w'} />
                        <Clock time={color === Color.BLACK ? blackTime : whiteTime} color={color === Color.BLACK ? 'black' : 'white'} dimmed={color === Color.BLACK ? boardState.turn() === 'w' : boardState.turn() === 'b'} />
                    </div>
                </Container>
            </Hidden>

            <Hidden mdUp>
                <div className='flex flex-row justify-center items-center h-full w-full'>
                    <Chessboard id={gameId} joinId={joinId} boardState={boardState} role={role} color={color} playing={playing} flipped={flipped} onMove={onMove} />
                </div>
            </Hidden>
        </>
    );
}