import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { use, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '@/components/chess/Chessboard';
import Movelist from '@/components/Movelist';
import { Button, Paper } from '@mui/material';
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

	const [boardState, setBoardState] = useState(new Chess());
	const [currentMove, setCurrentMove] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const [engineLoaded, setEngineLoaded] = useState(false);
	const engine = useRef(null);
	const [showEngine, setShowEngine] = useState(false);
	const [engineInfo, setEngineInfo] = useState({ bestMove: '', ponder: '', score: '', moveLine: '', depth: '' });

	const [deviation, setDeviation] = useState(false);

	async function onMove() {
		engine.current.stop();
		engine.current.setBoardState(boardState);
		engine.current.search(30).catch((err) => {
			console.error(err);
		});
	}

	function onBestMove(info) {
		setEngineInfo(info);
	}

	function loadEngine() {
		if(typeof window.Stockfish === 'function' && WebAssembly.current === undefined){
			window.Stockfish().then(async (sf) => {
				engine.current = new ChessEngine(sf);
				setEngineLoaded(true);
				engine.current.setBoardState(boardState);
				engine.current.addBestMoveListener(onBestMove);
				engine.current.search(30).catch((err) => {
					console.error(err);
				});
			});
		}
	}

	useEffect(() => {
		loadEngine();
	}, []);

	return (
		<div className='flex flex-row'>
			<Script src="/stockfish/stockfish.js" strategy='beforeInteractive'/>

			<Chessboard boardState={boardState} setBoardState={setBoardState} currentMove={currentMove} setCurrentMove={setCurrentMove} flipped={isFlipped} playing={true} onMove={(move) => {
				if (move.promotion === undefined) {
					move.promotion = "";
				}
				boardState.move(move);
				setBoardState(new Chess(boardState.fen()));
				setDeviation(true);
				onMove().catch((err) => {
					console.error(err);
				});
			}} />

			<Paper className='p-4'>
				<Button onClick={() => setShowEngine(!showEngine)}>
					Engine
				</Button>

				{showEngine && engineLoaded && (
					<div>
						<p>Best move: {engineInfo.bestMove}</p>
						<p>Ponder: {engineInfo.ponder}</p>
						<p>Score: {engineInfo.score}</p>
						<p>Move line: {engineInfo.moveLine}</p>
						<p>Depth: {engineInfo.depth}</p>
					</div>
				)}

				<Movelist moves={game.moves} />
				<Button onClick={() => setIsFlipped(!isFlipped)}>Flip board</Button>

				<Button onClick={async () => {
					if (currentMove > 0) {
						setCurrentMove(currentMove - 1);
						boardState.undo();
						onMove().catch((err) => {
							console.error(err);
						});
					}
				}}>Undo</Button>

				<Button onClick={async () => {
					if (currentMove < game.moves.length) {
						boardState.move(game.moves[currentMove]);
						setCurrentMove(currentMove + 1);
						onMove().catch((err) => {
							console.error(err);
						});
					}
				}
				}>Redo</Button>
			</Paper>
		</div>
	);
}