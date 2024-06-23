import { useRouter } from 'next/router';
import prisma from '@/lib/prisma';
import { use, useEffect, useRef, useState } from 'react';
import { Chess } from 'chess.js';
import Chessboard, { Color } from '@/components/chess/Chessboard';
import Movelist from '@/components/Movelist';
import { Box, Button, Container, Divider, FormControlLabel, Hidden, Paper, Radio, RadioGroup, Slider } from '@mui/material';
import Script from 'next/script';
import ChessEngine from '@/lib/engine';
import Evalbar from '@/components/Evalbar';
import { ArrowLeft, ArrowRight, Flip, Psychology } from '@mui/icons-material';

export default function PlayAI() {
	const router = useRouter();

	const [boardState, setBoardState] = useState(new Chess());
	const [currentMove, setCurrentMove] = useState(0);
	const [isFlipped, setIsFlipped] = useState(false);

	const [engineLoaded, setEngineLoaded] = useState(false);
	const engine = useRef(null);
	const [showEngine, setShowEngine] = useState(false);
	const [engineInfo, setEngineInfo] = useState({ bestMove: '', ponder: '', score: '', moveLine: '', depth: '' });

	const [color, setColor] = useState('w');
	const [thinkingTime, setThinkingTime] = useState(2000);
	const [depth, setDepth] = useState(20);

	function engineMove() {
		if (!engine.current) {
			return;
		}
		engine.current.stop();
		engine.current.setBoardState(boardState);
		engine.current.searchTime(depth, thinkingTime).then((info) => {
			if (color === boardState.turn()) {
				return;	
			}
			boardState.move(info.bestMove);
			setBoardState(new Chess(boardState.fen()));
			onMove().catch((err) => {
				console.error(err);
			});
		}).catch((err) => {
			console.error(err);
		});
	}

	async function onMove() {
		if (color !== boardState.turn()) {
			engineMove();
		}
	}

	function onBestMove(info) {
		setEngineInfo(info);
	}

	function loadEngine() {
		if(typeof window.Stockfish === 'function' && WebAssembly.current === undefined){
			window.Stockfish().then(async (sf) => {
				engine.current = new ChessEngine(sf);
				setEngineLoaded(true);
				engine.current.addBestMoveListener(onBestMove);
				engineMove();
			});
		}
	}

	useEffect(() => {
		engineMove();
	}, [color]);

	useEffect(() => {
		router.events.on('routeChangeStart', () => {
			engine.current?.stop();
		});

		loadEngine();
	}, []);

	return (
		<div className='flex flex-row'>
			<title>Play against AI</title>
			
			<Script src="/stockfish/stockfish.js" strategy='beforeInteractive' />
			
			<Hidden lgDown>
				<Container className='flex justify-center'>
					<div className='flex flex-row gap-2'>
						<Chessboard color={color} boardState={boardState} setBoardState={setBoardState} currentMove={currentMove} setCurrentMove={setCurrentMove} flipped={color === Color.BLACK || isFlipped} playing={true} onMove={(move) => {
							if (move.promotion === undefined) {
								move.promotion = "";
							}
							if (move.promotion === "") {
								delete move.promotion;
							}
							boardState.move(move);
							setBoardState(new Chess(boardState.fen()));
							onMove().catch((err) => {
								console.error(err);
							});
						}} />

						<Paper className='p-4 flex flex-col justify-between'>
							<div>
								{showEngine && engineLoaded && (
									<Paper className='p-4'>
										<Evalbar score={engineInfo.score} turn={boardState.turn()} />
										<div className='text-sm font-light p-2'>
											Depth {engineInfo.depth}
										</div>
										<div>
											<h1 className='line-clamp-1'><span className='font-bold'>{engineInfo.score * (boardState.turn() === 'w' ? 1 : -1) / 100 || engineInfo.score}</span> {engineInfo.bestMove}</h1>
										</div>
									</Paper>
								)}
							</div>

							<div>
								<div>
									<RadioGroup
										row
										defaultValue="b"
										value={color}
										onChange={(e) => setColor(e.target.value)}
									>
										<FormControlLabel value="w" control={<Radio />} label="White" />
										<FormControlLabel value="b" control={<Radio />} label="Black" />
									</RadioGroup>
								</div>

								<Box className='flex justify-between items-center mt-5 w-full flex-col'>
									<h1>AI Thinking time (s)</h1>
									<Slider
										aria-label="Thinking time"
										defaultValue={5}
										onChange={(e, value) => setThinkingTime(value * 1000)}
										valueLabelDisplay="auto"
										step={0.1}
										min={0.1}
										max={10}
									/>
								</Box>

								<Box className='flex justify-between items-center mt-5 w-full flex-col'>
									<h1>Search depth</h1>
									<Slider
										aria-label="Depth"
										defaultValue={20}
										onChange={(e, value) => setDepth(value)} 
										valueLabelDisplay="auto"
										step={1}
										min={1}
										max={30}
									/>
								</Box>
							</div>

							<div className='flex flex-row'>
								<Button onClick={() => setIsFlipped(!isFlipped)}>
									<Flip />
								</Button>

								<Divider orientation="vertical" flexItem />

								<Button onClick={() => {
									setShowEngine(!showEngine);
								}}>
									<Psychology />
								</Button>
							</div>
						</Paper>
					</div>
				</Container>
			</Hidden>
			
			<Hidden lgUp>
				<div className='flex flex-col justify-center items-center h-full w-full gap-2'>
					<Chessboard color={color} boardState={boardState} setBoardState={setBoardState} currentMove={currentMove} setCurrentMove={setCurrentMove} flipped={color === Color.BLACK || isFlipped} playing={true} onMove={(move) => {
							if (move.promotion === undefined) {
							move.promotion = "";
						}
						if (move.promotion === "") {
							delete move.promotion;
						}
						boardState.move(move);
						setBoardState(new Chess(boardState.fen()));
						onMove().catch((err) => {
							console.error(err);
						});
					}} />

					<Paper className='p-4 flex flex-col justify-between'>
						<div>
							{engineLoaded && showEngine && (
								<Paper className='p-4'>
									<Evalbar score={engineInfo.score} turn={boardState.turn()} />
									<div className='text-sm font-light p-2'>
										Depth {engineInfo.depth}
									</div>
									<div>
										<h1 className='line-clamp-1'><span className='font-bold'>{engineInfo.score * (boardState.turn() === 'w' ? 1 : -1) / 100 || engineInfo.score}</span> {engineInfo.bestMove}</h1>
									</div>
								</Paper>
							)}
						</div>
						
						<Box className='flex justify-between items-center mt-5 w-full flex-col'>
							<h1>AI Thinking time (s)</h1>
							<Slider
								aria-label="Thinking time"
								defaultValue={5}
								onChange={(e, value) => setThinkingTime(value * 1000)}
								valueLabelDisplay="auto"
								step={0.1}
								min={0.1}
								max={10}
							/>
						</Box>

						<Box className='flex justify-between items-center mt-5 w-full flex-col'>
							<h1>Search depth</h1>
							<Slider
								aria-label="Depth"
								defaultValue={20}
								onChange={(e, value) => setDepth(value)} 
								valueLabelDisplay="auto"
								step={1}
								min={1}
								max={30}
							/>
						</Box>

						<div className='flex flex-row'>
							<Button onClick={() => setIsFlipped(!isFlipped)}>
								<Flip />
							</Button>

							<Divider orientation="vertical" flexItem />

							<Button onClick={() => {
								setShowEngine(!showEngine);
							}}>
								<Psychology />
							</Button>
						</div>
					</Paper>
				</div>
			</Hidden>
		</div>
	);
}