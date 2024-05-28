import { Chess, SQUARES } from "chess.js";
import { useEffect, useState } from "react";
import Piece from "./Piece";
import useMousePosition from "../hooks/useMousePosition";

const Role = {
	WHITE: 'w',
	BLACK: 'b',
	SPECTATOR: 's'
};

// returns gameid in id and whiteId and blackId
export async function createGame() {
	const response = await fetch('http://localhost:2425/ws/create', {
		method: 'POST'
	});
	const data = await response.json();
	return data;
}

export default function Chessboard({ id, joinId }) {
	const [boardState, setBoardState] = useState(new Chess());
	const [role, setRole] = useState(Role.WHITE);
	const [hoverSquare, setHoverSquare] = useState(null);
	const [playing, setPlaying] = useState(false);
	const [flipped, setFlipped] = useState(true);

	const mousePosition = useMousePosition({ includeTouch: true });

	useEffect(() => {
		const client = new WebSocket('ws://localhost:2425/ws');
		client.onopen = () => {
			client.send(JSON.stringify({
				'id': id,
				'joinId': joinId,
				'type': 'join'
			}));
		};
		client.onmessage = (message) => {
			if (JSON.parse(message.data).error) {
				console.error(JSON.parse(message.data).error);
				return;
			}

			if (JSON.parse(message.data).board) {
				setBoardState(new Chess(JSON.parse(message.data).board));
				return;
			}

			if (JSON.parse(message.data).role) {
				setRole(JSON.parse(message.data).role);
				setFlipped(JSON.parse(message.data).role === Role.BLACK);
				return;
			}

			if (JSON.parse(message.data).playing) {
				setPlaying(JSON.parse(message.data).playing);
				return;
			}
		};


		const handleMouseUp = () => {
			setHoverSquare(null);
		};
	
		if (typeof window !== 'undefined') {
			window.addEventListener('mouseup', handleMouseUp);
		}
	
		// Clean up the event listener when the component is unmounted
		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('mouseup', handleMouseUp);
			}
		};
	}, []);

	return (
		<>
			<div className={"fixed transform " + (hoverSquare ? 'block' : 'hidden')} style={{ top: mousePosition.y, left: mousePosition.x, zIndex: 1000, pointerEvents: 'none', transform: 'translate(-50%, -50%)'
			}}
			>
				{hoverSquare ? (
					<Piece
						type={boardState.get(hoverSquare).type}
						color={boardState.get(hoverSquare).color}
						width={50}
						height={50}
					/>
				) : null}
			</div>

			{flipped ?
				Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="h-12 flex flex-row select-none">
						{Array.from({ length: 8 }).map((_, j) => (
							<div key={j} className={`square ${i % 2 === j % 2 ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'} w-12 h-12`}
								onMouseDown={() => {
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * (8 - i) + j])?.color !== role) return;

									if (boardState.get(SQUARES[8 * (8 - i) + j])) {
										setHoverSquare(SQUARES[8 * (8 - i) + j]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * (8 - i) + j]))) {
											
											boardState.move({ from: hoverSquare, to: SQUARES[8 * (8 - i) + j] });

											setBoardState(new Chess(boardState.fen()));
										}
										setHoverSquare(null);
									}
								}}
							>
								{boardState.get(SQUARES[8 * (8 - i) + j]) && hoverSquare !== SQUARES[8 * (8 - i) + j] ? (
									<Piece
										type={boardState.get(SQUARES[8 * (8 - i) + j]).type}
										color={boardState.get(SQUARES[8 * (8 - i) + j]).color}
										width={50}
										height={50}
										props={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
									/>
								) : null}
							</div>
						))}
					</div>
				))
			:
				Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="h-12 flex flex-row select-none">
						{Array.from({ length: 8 }).map((_, j) => (
							<div key={j} className={`square ${i % 2 === j % 2 ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'} w-12 h-12`}
								onMouseDown={() => {
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * i + j])?.color !== role) return;

									if (boardState.get(SQUARES[8 * i + j])) {
										setHoverSquare(SQUARES[8 * i + j]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * i + j]))) {
											
											boardState.move({ from: hoverSquare, to: SQUARES[8 * i + j] });

											setBoardState(new Chess(boardState.fen()));
										}
										setHoverSquare(null);
									}
								}}
							>
								{boardState.get(SQUARES[8 * i + j]) && hoverSquare !== SQUARES[8 * i + j] ? (
									<Piece
										type={boardState.get(SQUARES[8 * i + j]).type}
										color={boardState.get(SQUARES[8 * i + j]).color}
										width={50}
										height={50}
										props={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
									/>
								) : null}
							</div>
						))}
					</div>
				))
			}
		</>
	);
};