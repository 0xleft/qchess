import Chessboard, { Color, Role } from '@/components/chess/Chessboard';
import { Button } from '@mui/material';
import { Chess } from 'chess.js';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function ExploreIndex() {

	const [boardState, setBoardState] = useState(new Chess("r3k2r/p1ppqpb1/Bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 0 1"));
	const [role, setRole] = useState(Role.PLAYER);
	const [color, setColor] = useState(Color.ALL);
	const [flipped, setFlipped] = useState(false);

	function onMove(move) {
		if (move.promotion === "") {
			delete move["promotion"];
		}
		boardState.move(move);
		setBoardState(new Chess(boardState.fen()));
	}

	return (
		<>
			<Chessboard onMove={onMove} boardState={boardState} role={role} color={color} playing={true} flipped={flipped} />
		</>
	)
}