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

function promotionMenu({ onSelect, color, position, move }) {
	return (
		<div className="fixed" style={{ top: position.y, left: position.x, zIndex: 1000 }}>
			<div className="flex flex-row bg-white">
				{['q', 'r', 'b', 'n'].map((piece, i) => (
					<div key={i} className="flex flex-row" onClick={() => onSelect(piece, move)}>
						<Piece type={piece} color={color} width={50} height={50} />
					</div>
				))}
			</div>
		</div>
	);
}

export default function Chessboard({ moves, onMove, fen }) {

	const [boardState, setBoardState] = useState(new Chess(fen));
	const [hoverSquare, setHoverSquare] = useState(null);
	const [flipped, setFlipped] = useState(false)
	const [selectingPromotion, setSelectingPromotion] = useState(false);
	const [lastMove, setLastMove] = useState(null);
	const [promotionMousePosition, setPromotionMousePosition] = useState(null);

	const mousePosition = useMousePosition({ includeTouch: true });

	function onSelectPromotion(piece, move) {
		boardState.move({ from: move.from, to: move.to, promotion: piece });
		setBoardState(new Chess(boardState.fen()));
		setSelectingPromotion(false);
	};

	useEffect(() => {
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
									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!boardState) return;

									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])) {
										setHoverSquare(SQUARES[8 * (7 - i) + (7 - j)]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * (7 - i) + (7 - j)]))) {

											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												return;
											}

											boardState.move({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });

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
									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!boardState) return;

									if (boardState.get(SQUARES[8 * i + j])) {
										setHoverSquare(SQUARES[8 * i + j]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (moves.some(move => move.includes(SQUARES[8 * i + j]))) {
											
											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												return;
											}

											boardState.move({ from: hoverSquare, to: SQUARES[8 * i + j] });

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

			{selectingPromotion ? promotionMenu({ onSelect: onSelectPromotion, color: boardState.get(lastMove.from).color, position: promotionMousePosition, move: lastMove }) : null}
		</>
	);
};