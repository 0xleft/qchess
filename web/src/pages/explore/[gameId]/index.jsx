import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '@/components/chess/Chessboard';
import Movelist from '@/components/Movelist';
import { Button } from '@mui/material';

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

    const [boardState, setBoardState] = useState(new Chess());
    const [currentMove, setCurrentMove] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const [engineLoaded, setEngineLoaded] = useState(false);
    const engine = useRef(null);

    return (
        <div className='flex flex-row'>
            <script src="stockfish.js" onLoad={() => {
                Stockfish().then((sf) => {
                    engine.current = sf;
                    setEngineLoaded(true);
                });
            }}></script>

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