import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { use, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard from '@/components/chess/Chessboard';
import Movelist from '@/components/Movelist';
import { Button, Container, Divider, Paper } from '@mui/material';
import Script from 'next/script';
import ChessEngine from '@/lib/engine';
import Evalbar from '@/components/Evalbar';
import { ArrowLeft, ArrowRight, Flip, Psychology } from '@mui/icons-material';

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

	const [boardState, setBoardState] = useState(new Chess());
	const [currentMove, setCurrentMove] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const [engineLoaded, setEngineLoaded] = useState(false);
	const engine = useRef(null);
	const [showEngine, setShowEngine] = useState(false);
	const [engineInfo, setEngineInfo] = useState({ bestMove: '', ponder: '', score: '', moveLine: '', depth: '' });

	const [deviation, setDeviation] = useState(false);
	const [beforeDeviation, setBeforeDeviation] = useState(0);

	async function onMove() {
		engine.current.stop();
		engine.current.setBoardState(boardState);
		engine.current.search(40).catch((err) => {
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
				engine.current.search(40).catch((err) => {
					console.error(err);
				});
			});
		}
	}

	useEffect(() => {

		router.events.on('routeChangeStart', () => {
			engine.current?.stop();
		});

		loadEngine();
	}, []);

	return (
		<div className='flex flex-row'>
			<Script src="/stockfish/stockfish.js" strategy='beforeInteractive' />
			
			<Container className='flex justify-center'>
				<div className='flex flex-row gap-2'>
					<Chessboard boardState={boardState} setBoardState={setBoardState} currentMove={currentMove} setCurrentMove={setCurrentMove} flipped={isFlipped} playing={true} onMove={(move) => {
						if (move.promotion === undefined) {
							move.promotion = "";
						}
						if (move.promotion === "") {
							delete move.promotion;
						}
						boardState.move(move);
						setBoardState(new Chess(boardState.fen()));
						setDeviation(true);
						setBeforeDeviation(currentMove);
						onMove().catch((err) => {
							console.error(err);
						});
					}} />

					<Paper className='p-4 flex flex-col justify-between'>
						<div>
							{showEngine && engineLoaded && (
								<Paper>
									<div>
										{engineInfo.score}
									</div>
									<Evalbar score={engineInfo.score * (boardState.turn() === 'w' ? 1 : -1)} />
								</Paper>
							)}
							<Movelist className='' moves={game.moves} highlight={currentMove} onClick={(index) => {
								setCurrentMove(index);
								setBoardState(new Chess());
								for (let i = 0; i < index; i++) {
									boardState.move(game.moves[i]);
								}
								setBoardState(new Chess(boardState.fen()));
								onMove().catch((err) => {
									console.error(err);
								});
							}} />
						</div>
						

						<div className='flex flex-row'>
							<Button onClick={() => setIsFlipped(!isFlipped)}>
								<Flip />
							</Button>

							<Divider orientation="vertical" flexItem />

							<Button onClick={async () => {
								if (deviation) {
									setDeviation(false);
									let newBoard = new Chess();
									for (let i = 0; i < currentMove; i++) {
										newBoard.move(game.moves[i]);
									}

									setBoardState(newBoard);
									setCurrentMove(currentMove - 1);
									return;
								}
								if (currentMove > 0) {
									setCurrentMove(currentMove - 1);
									boardState.undo();
									onMove().catch((err) => {
										console.error(err);
									});
								}
							}}>
								<ArrowLeft />
							</Button>

							<Divider orientation="vertical" flexItem />

							<Button onClick={async () => {
								if (deviation) {
									setDeviation(false);
									setBoardState(beforeDeviation);
									setCurrentMove(currentMove + 1);

									let newBoard = new Chess();
									for (let i = 0; i < beforeDeviation + 1; i++) {
										newBoard.move(game.moves[i]);
									}

									setBoardState(newBoard);
									return;
								}
								if (currentMove < game.moves.length) {
									boardState.move(game.moves[currentMove]);
									setCurrentMove(currentMove + 1);
									onMove().catch((err) => {
										console.error(err);
									});
								}
							}
							}>
								<ArrowRight />
							</Button>

							<Divider orientation="vertical" flexItem />

							<Button onClick={async () => {
								setShowEngine(!showEngine);
							}}>
								<Psychology />
							</Button>
						</div>
						
					</Paper>
				</div>
			</Container>
		</div>
	);
}