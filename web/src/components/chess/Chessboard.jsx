import { Chess, SQUARES } from "chess.js";
import { useEffect, useState } from "react";
import Piece from "./Piece";
import useMousePosition from "../hooks/useMousePosition";

const Role = {
	SPECTATOR: 'spectator',
	PLAYER: 'player'
};

const Color = {
	WHITE: 'w',
	BLACK: 'b'
};

export default function Chessboard({ id, joinId }) {
	const [boardState, setBoardState] = useState(null);
	const [role, setRole] = useState(Role.PLAYER);
	const [color, setColor] = useState(Color.WHITE);
	const [hoverSquare, setHoverSquare] = useState(null);
	const [playing, setPlaying] = useState(false);
	const [flipped, setFlipped] = useState(false);
	const [client, setClient] = useState(null);

	const mousePosition = useMousePosition({ includeTouch: true });

	function sendMove(move) {
		if (!client) return;
		client.send(JSON.stringify({
			'id': id,
			'type': 'move',
			'move': move
		}).toString());
	};

	useEffect(() => {
		const client = new WebSocket('ws://localhost:2425/ws');
		setClient(client);
		client.onopen = () => {
			client.send(JSON.stringify({
				'id': id,
				'joinId': joinId || 'none',
				'type': 'join'
			}).toString());
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
				setColor(JSON.parse(message.data).color === 'white' ? Color.WHITE : Color.BLACK);
				setFlipped(JSON.parse(message.data).color === 'black' ? true : false);
				return;
			}

			if (JSON.parse(message.data).playing) {
				setPlaying(Boolean(JSON.parse(message.data).playing));
				return;
			}
		};

		const handleMouseUp = () => {
			setHoverSquare(null);
		};
	
		if (typeof window !== 'undefined') {
			window.addEventListener('mouseup', handleMouseUp);
		}
	
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
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])?.color !== color) return;

									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])) {
										setHoverSquare(SQUARES[8 * (7 - i) + (7 - j)]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * (7 - i) + (7 - j)]))) {
											
											boardState.move({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
											sendMove(`${hoverSquare}${SQUARES[8 * (7 - i) + (7 - j)]}`);

											setBoardState(new Chess(boardState.fen()));
										}
										setHoverSquare(null);
									}
								}}
							>
								
								{boardState && boardState.get(SQUARES[8 * (7 - i) + (7 - j)]) && hoverSquare !== SQUARES[8 * (7 - i) + (7 - j)] ? (
									<Piece
										type={boardState.get(SQUARES[8 * (7 - i) + (7 - j)]).type}
										color={boardState.get(SQUARES[8 * (7 - i) + (7 - j)]).color}
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
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * i + j])?.color !== color) return;

									if (boardState.get(SQUARES[8 * i + j])) {
										setHoverSquare(SQUARES[8 * i + j]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * i + j]))) {
											
											boardState.move({ from: hoverSquare, to: SQUARES[8 * i + j] });
											sendMove(`${hoverSquare}${SQUARES[8 * i + j]}`);

											setBoardState(new Chess(boardState.fen()));
										}
										setHoverSquare(null);
									}
								}}
							>
								{boardState && boardState.get(SQUARES[8 * i + j]) && hoverSquare !== SQUARES[8 * i + j] ? (
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