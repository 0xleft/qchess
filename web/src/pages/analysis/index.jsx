import Chessboard from '@/components/chess/AnalysisChessboard';
import { Button } from '@mui/material';
import { Chess } from 'chess.js';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function AnalysisIndex() {

	const [engineLoaded, setEngineLoaded] = useState(false);
	const [boardState, setBoardState] = useState(new Chess("rnbqkb1r/ppp1pppp/3p1n2/4P3/3P4/8/PPP2PPP/RNBQKBNR w KQkq - 0 1"));

	const engine = useRef(null);

	function onMove(move) {
		if (move.promotion === "") {
			delete move["promotion"];
		}
		boardState.move(move);
		setBoardState(new Chess(boardState.fen()));
		engine.current.setFen(boardState.fen());
	}

	function loadEngine() {
		if(typeof window.Engine === 'function' && WebAssembly.current === undefined){
			window.Engine().then((loadedEngine) => {
				engine.current = new loadedEngine.Engine(boardState.fen());
				setEngineLoaded(true);
			});
		}
	}

	useEffect(() => {
		loadEngine();
	}, []);

	// todo remove this effect
	useEffect(() => {
		if(engineLoaded){
			console.log(engine.current);
		}
	}, [engineLoaded]);

	return (
		<>
			<Script src="/engine.js" strategy='beforeInteractive'/>

			<Chessboard onMove={onMove} boardState={boardState} />

			<Button onClick={() => {
				console.log(engine.current.getBestMove(boardState.turn() === 'w'));
			}}>Best move</Button>

			<Button onClick={() => {
				let bestMove = engine.current.getBestMove(boardState.turn() === 'w');
				
				try {
					onMove({ from: bestMove.slice(0, 2), to: bestMove.slice(2, 4), promotion: bestMove.slice(4) });
				} catch (e) {
					console.log(e);
				}
			}}>Do best move</Button>
		</>
	)
}