import Chessboard from '@/components/chess/AnalysisChessboard';
import { Button } from '@mui/material';
import { Chess } from 'chess.js';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function ViewIndex() {

	const [boardState, setBoardState] = useState(new Chess("r3k2r/p1ppqpb1/Bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 0 1"));

	function onMove(move) {
		if (move.promotion === "") {
			delete move["promotion"];
		}
		boardState.move(move);
		setBoardState(new Chess(boardState.fen()));
	}

	return (
		<>
			<Chessboard onMove={onMove} boardState={boardState} />
		</>
	)
}