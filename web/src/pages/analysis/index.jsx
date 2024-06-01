import Chessboard from '@/components/chess/AnalysisChessboard';
import { Button } from '@mui/material';
import { Chess } from 'chess.js';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function AnalysisIndex() {

	const [engineLoaded, setEngineLoaded] = useState(false);
	const [boardState, setBoardState] = useState(new Chess("6B1/1p6/1p6/3R4/1k6/8/Q2K4/8 w - - 0 1"));

	const engine = useRef(null);

	function onMove(move) {
		boardState.move(move);
		engine.current.move(move.from + move.to + (move.promotion ? move.promotion : ''));
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

			<Chessboard onMove={onMove} fen={boardState.fen()} />

			<Button onClick={() => {
				console.log(engine.current.getBestMove(true));
			}}>Best move</Button>
		</>
	)
}