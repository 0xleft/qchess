import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '@/components/chess/Chessboard';
import Movelist from '@/components/Movelist';
import { Button } from '@mui/material';
import Script from 'next/script';
import ChessEngine from '@/lib/stockfish';

export async function getServerSideProps({ params }) {

    const { gameId } = params;

    const data = await prisma.chessGame.findUnique({
        where: {
            gameId: gameId,
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
                playedAt: data.playedAt.toString(),
            }
        },
    };
}

export default function ExploreID({ game }) {
    const router = useRouter();
    const { gameId } = router.query;

    const [boardState, setBoardState] = useState(new Chess("4r1k1/r1q2ppp/ppp2n2/4P3/5Rb1/1N1BQ3/PPP3PP/R5K1 w - - 1 17"));
    const [currentMove, setCurrentMove] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [engineLoaded, setEngineLoaded] = useState(false);
    const engine = useRef(null);

    function loadEngine() {
		if(typeof window.Stockfish === 'function' && WebAssembly.current === undefined){
			window.Stockfish().then(async (sf) => {
				engine.current = new ChessEngine(sf);
				setEngineLoaded(true);
                engine.current.setBoardState(boardState);
                console.log(await engine.current.search(20))
                console.log(await engine.current.search(20, 2000))
            });
		}
	}

    return (
        <div className='flex flex-row'>
            <Script src="/stockfish/stockfish.js" strategy='beforeInteractive'/>

            <Chessboard boardState={boardState} setBoardState={setBoardState} currentMove={currentMove} setCurrentMove={setCurrentMove} flipped={isFlipped} />

            <div>
                <Movelist moves={game.moves} />
                <Button onClick={() => setIsFlipped(!isFlipped)}>Flip board</Button>

                <Button onClick={() => {
                    if (currentMove > 0) {
                        setCurrentMove(currentMove - 1);
                        boardState.undo();
                    }
                }}>Undo</Button>

                <Button onClick={() => {
                    if (currentMove < game.moves.length) {
                        boardState.move(game.moves[currentMove]);
                        setCurrentMove(currentMove + 1);
                    }
                }
                }>Redo</Button>
            </div>
        </div>
    );
}