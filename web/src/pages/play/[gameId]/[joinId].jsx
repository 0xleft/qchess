import { useRouter } from 'next/router';
import Chessboard, { Color, Role } from '@/components/chess/Chessboard';
import { Button, Container, Hidden, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import Clock from '@/components/chess/Clock';
import { Balance, ContentCopy, Done, Flag, MoreHoriz, MoreVert, ThreeDRotation } from '@mui/icons-material';

export const getServerSideProps = async ({ req, res }) => {
    return {
        props: {}
    };
};

export default function PlayID() {
    const router = useRouter();
    const { gameId, joinId, otherId } = router.query;

    const [boardState, setBoardState] = useState(null);
	const [role, setRole] = useState(Role.PLAYER);
	const [color, setColor] = useState(Color.WHITE);
	const [flipped, setFlipped] = useState(false);
	const [client, setClient] = useState(null);

    const [mobileMenu, setMobileMenu] = useState(false);

    const [increments, setIncrements] = useState(5);

    const [whiteTime, setWhiteTime] = useState(0);
    const [blackTime, setBlackTime] = useState(0);

    const [popup, setPopup] = useState(false);
    const [winner, setWinner] = useState(null);

    const [offeredDraw, setOfferedDraw] = useState(false);

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

            if (JSON.parse(message.data).drawOffered) {
                setOfferedDraw(JSON.parse(message.data).drawOffered == true);
                return;
            }

            if (JSON.parse(message.data).winner) {
                setPopup(true);
                setWinner(JSON.parse(message.data).winner);
                return;
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
        };
    }

    useEffect(() => {
        connectToGame();
    }, []);

    return (
        <>
            {/* popup in middle */}
            {
                popup && (
                    <Paper className='fixed top-1/4 md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-lg shadow-lg min-w-64 flex flex-col'>
                        <h1 className='text-4xl text-center'>{winner === 'draw' ? 'Draw' : `${winner} wins!`}</h1>
                        <Button onClick={() => {
                            // todo
                        }} className='w-full mt-4' variant="contained">Rematch</Button>
                    </Paper>
                )
            }
            

            <Hidden lgDown>
                <Container className='flex flex-row'>
                    <Chessboard id={gameId} joinId={joinId} boardState={boardState} role={role} color={color} playing={winner === null} flipped={flipped} onMove={onMove} />
                    <div className='w-full flex flex-col justify-between'>
                        <Clock time={color === Color.BLACK ? whiteTime : blackTime} color={color === Color.BLACK ? 'white' : 'black'} dimmed={color === Color.BLACK ? boardState?.turn() === 'b' : boardState?.turn() === 'w'} />

                        <div>
                            <Paper className='p-4 flex flex-col gap-4'>
                                <div className='flex flex-row gap-2'>
                                    <Button variant='text' color='primary' className='w-full' onClick={() => {
                                        client.send(JSON.stringify({
                                            'id': gameId,
                                            'move': 'resign',
                                            'type': 'move'
                                        }).toString());
                                    }}>
                                        <Flag /> Resign
                                    </Button>
                                    <Button variant='text' color={offeredDraw ? 'success' : 'primary'} className='w-full' onClick={() => {
                                        client.send(JSON.stringify({
                                            'id': gameId,
                                            'move': 'draw',
                                            'type': 'move'
                                        }).toString());
                                    }}>
                                        {
                                            offeredDraw ? <><Done /> Accept draw</> : <><Balance /> Offer draw</>
                                        }
                                    </Button>
                                </div>

                                {
                                    otherId && (
                                        <Button variant='text' color='primary' className='w-full' onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/play/${gameId}/${otherId}`);
                                        }}>
                                            <ContentCopy /> Copy link
                                        </Button>
                                    )
                                }
                            </Paper>
                        </div>

                        <Clock time={color === Color.BLACK ? blackTime : whiteTime} color={color === Color.BLACK ? 'black' : 'white'} dimmed={color === Color.BLACK ? boardState?.turn() === 'w' : boardState?.turn() === 'b'} />
                    </div>
                </Container>
            </Hidden>

            <Hidden lgUp>
                <div className='flex flex-col justify-center items-center h-full w-full gap-2'>
                    <Clock time={color === Color.BLACK ? whiteTime : blackTime} color={color === Color.BLACK ? 'white' : 'black'} dimmed={color === Color.BLACK ? boardState?.turn() === 'b' : boardState?.turn() === 'w'} />
                    <Chessboard id={gameId} joinId={joinId} boardState={boardState} role={role} color={color} playing={winner === null} flipped={flipped} onMove={onMove} />
                    <div className='flex flex-row gap-2'>
                        <Clock time={color === Color.BLACK ? blackTime : whiteTime} color={color === Color.BLACK ? 'black' : 'white'} dimmed={color === Color.BLACK ? boardState?.turn() === 'w' : boardState?.turn() === 'b'} />
                        <Button variant='text' color='primary' onClick={() => {
                            setMobileMenu(!mobileMenu);
                        }}>
                            <MoreHoriz />
                        </Button>

                        {
                            mobileMenu && (
                                <Paper className='fixed transform p-4 rounded-lg shadow-lg flex flex-col gap-4'>
                                    <Button variant='text' color='primary' className='w-full' onClick={() => {
                                        client.send(JSON.stringify({
                                            'id': gameId,
                                            'move': 'resign',
                                            'type': 'move'
                                        }).toString());
                                    }}>
                                        <Flag /> Resign
                                    </Button>
                                    <Button variant='text' color={offeredDraw ? 'success' : 'primary'} className='w-full' onClick={() => {
                                        client.send(JSON.stringify({
                                            'id': gameId,
                                            'move': 'draw',
                                            'type': 'move'
                                        }).toString());
                                    }}>
                                        {
                                            offeredDraw ? <><Done /> Accept draw</> : <><Balance /> Offer draw</>
                                        }
                                    </Button>
                                    {
                                        otherId && (
                                            <Button variant='text' color='primary' className='w-full' onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/play/${gameId}/${otherId}`);
                                            }}>
                                                <ContentCopy /> Copy link
                                            </Button>
                                        )
                                    }
                                </Paper>
                            )
                        }
                    </div>
                    
                </div>
            </Hidden>
        </>
    );
}