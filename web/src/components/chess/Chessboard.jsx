import { Chess, SQUARES } from "chess.js";
import { useEffect, useState } from "react";
import Piece from "./Piece";
import useMousePosition from "../hooks/useMousePosition";

export const Role = {
	SPECTATOR: 'spectator',
	PLAYER: 'player',
};

export const Color = {
	WHITE: 'w',
	BLACK: 'b',
	ALL: 'a',
};

function promotionMenu({ onSelect, color, position, move, size }) {
	return (
		<div className="fixed" style={{ top: position.y, left: position.x, zIndex: 1000 }}>
			<div className="flex flex-row bg-white">
				{['q', 'r', 'b', 'n'].map((piece, i) => (
					<div key={i} className="flex flex-row" onClick={() => onSelect(piece, move)}>
						<Piece type={piece} color={color} width={size} height={size} />
					</div>
				))}
			</div>
		</div>
	);
}

export default function Chessboard({ boardState, role, color, playing, flipped, onMove = () => {}, onSelect = () => {} }) {
	const [size, setSize] = useState(100);

	function resize() {
		if (window.innerWidth < 600) {
			setSize(window.innerWidth / 8);
		}
		if (window.innerWidth >= 600 && window.innerWidth < 960) {
			setSize(window.innerWidth / 10);
		}
		if (window.innerWidth > 960 && window.innerWidth < 1200) {
			setSize(80);
		}
	}

	useEffect(() => {
		if (typeof window !== 'undefined') {
			resize();
			window.addEventListener('resize', () => {
				resize();
			});
		}
	}, []);

	const [hoverSquare, setHoverSquare] = useState(null);
	const [selectingPromotion, setSelectingPromotion] = useState(false);
	const [lastMove, setLastMove] = useState(null);
	const [promotionMousePosition, setPromotionMousePosition] = useState(null);

	const [touching, setTouching] = useState(false);

	const mousePosition = useMousePosition({ includeTouch: true });

	function onSelectPromotion(piece, move) {
		onMove({ from: move.from, to: move.to, promotion: piece });
		setSelectingPromotion(false);
		setHoverSquare(null);
	};

	return (
		<div>
			<div className={"fixed transform " + (hoverSquare ? 'block' : 'hidden')} style={{ top: mousePosition.y, left: mousePosition.x, zIndex: 1000, pointerEvents: 'none', transform: 'translate(-50%, -50%)'
			}}
			>
				{hoverSquare && !touching ? (
					<Piece
						type={boardState.get(hoverSquare).type}
						color={boardState.get(hoverSquare).color}
						width={size}
						height={size}
					/>
				) : null}
			</div>

			{flipped ?
				Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex flex-row select-none" style={{ height: size }}>
						{Array.from({ length: 8 }).map((_, j) => (
							<div key={j} className={`${i % 2 === j % 2 ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`} style={{ width: size, height: size }}
								onTouchStart={() => {
									setTouching(true);
								}}

								onClick={() => {
									if (!touching) return;

									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])?.color !== color && !color === Color.ALL) return;

									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });

										if (boardState.get(hoverSquare).type === 'k' && Math.abs(SQUARES.indexOf(hoverSquare) - SQUARES.indexOf(SQUARES[8 * (7 - i) + (7 - j)])) === 2) {
											try {
												boardState.move({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
												boardState.undo();
											} catch (e) {
												setHoverSquare(null);
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
											setHoverSquare(null);
											return;
										}

										if (moves.some(move => move.includes(SQUARES[8 * (7 - i) + (7 - j)]))) {
											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												setHoverSquare(null);
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
											setHoverSquare(null);
											return;
										}
										setHoverSquare(null);
									}

									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])) {
										setHoverSquare(SQUARES[8 * (7 - i) + (7 - j)]);
										onSelect(SQUARES[8 * (7 - i) + (7 - j)]);
									}
								}}

								onMouseDown={() => {
									if (touching) return;
									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])?.color !== color && !color === Color.ALL) return;

									if (boardState.get(SQUARES[8 * (7 - i) + (7 - j)])) {
										setHoverSquare(SQUARES[8 * (7 - i) + (7 - j)]);
										onSelect(SQUARES[8 * (7 - i) + (7 - j)]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare && !touching) {
										const moves = boardState.moves({ square: hoverSquare });

										if (boardState.get(hoverSquare).type === 'k' && Math.abs(SQUARES.indexOf(hoverSquare) - SQUARES.indexOf(SQUARES[8 * (7 - i) + (7 - j)])) === 2) {
											try {
												boardState.move({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
												boardState.undo();
											} catch (e) {
												setHoverSquare(null);
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
										}

										if (moves.some(move => move.includes(SQUARES[8 * (7 - i) + (7 - j)]))) {
											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * (7 - i) + (7 - j)] });
										}
										setHoverSquare(null);
									}
								}}
							>
								{hoverSquare && boardState.moves({ square: hoverSquare }).some(move => move.includes(SQUARES[8 * (7 - i) + (7 - j)])) ? (
									<div draggable={false} className="absolute bg-blue-500 bg-opacity-50 pointer-events-none" style={{ width: size, height: size }} />
								) : null}
								{boardState && boardState.get(SQUARES[8 * (7 - i) + (7 - j)]) && (hoverSquare !== SQUARES[8 * (7 - i) + (7 - j)] || touching) ? (
									<Piece
										type={boardState.get(SQUARES[8 * (7 - i) + (7 - j)]).type}
										color={boardState.get(SQUARES[8 * (7 - i) + (7 - j)]).color}
										width={size}
										height={size}
										props={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
									/>
								) : null}
							</div>
						))}
					</div>
				))
			:
				Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className="flex flex-row select-none" style={{ height: size }}>
						{Array.from({ length: 8 }).map((_, j) => (
							<div key={j} className={`${i % 2 === j % 2 ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}`} style={{ width: size, height: size }}
								onTouchStart={() => {
									setTouching(true);
								}}

								onClick={() => {
									if (!touching) return;

									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * i + j])?.color !== color && !color === Color.ALL) return;

									if (hoverSquare) {
										const moves = boardState.moves({ square: hoverSquare });
										if (boardState.get(hoverSquare).type === 'k' && Math.abs(SQUARES.indexOf(hoverSquare) - SQUARES.indexOf(SQUARES[8 * i + j])) === 2) {
											try {
												boardState.move({ from: hoverSquare, to: SQUARES[8 * i + j] });
												boardState.undo();
											} catch (e) {
												setHoverSquare(null);
												return;
											}
											setHoverSquare(null);
											onMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
											return;
										}
										if (moves.some(move => move.includes(SQUARES[8 * i + j]))) {
											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												setHoverSquare(null);
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
											setHoverSquare(null);
											return;
										}
										setHoverSquare(null);
									}

									if (boardState.get(SQUARES[8 * i + j])) {
										setHoverSquare(SQUARES[8 * i + j]);
										onSelect(SQUARES[8 * i + j]);
									}
								}}

								onMouseDown={() => {
									if (touching) return;
									if (selectingPromotion) {
										setSelectingPromotion(false);
										return;
									};
									if (!playing) return;
									if (!boardState) return;
									if (role === Role.SPECTATOR) return;
									if (boardState.get(SQUARES[8 * i + j])?.color !== color && !color === Color.ALL) return;

									if (boardState.get(SQUARES[8 * i + j])) {
										setHoverSquare(SQUARES[8 * i + j]);
										onSelect(SQUARES[8 * i + j]);
									}
								}}

								onMouseUp={() => {
									if (hoverSquare && !touching) {
										const moves = boardState.moves({ square: hoverSquare });
										if (boardState.get(hoverSquare).type === 'k' && Math.abs(SQUARES.indexOf(hoverSquare) - SQUARES.indexOf(SQUARES[8 * i + j])) === 2) {
											try {
												boardState.move({ from: hoverSquare, to: SQUARES[8 * i + j] });
												boardState.undo();
											} catch (e) {
												setHoverSquare(null);
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
										}
										if (moves.some(move => move.includes(SQUARES[8 * i + j]))) {
											if (boardState.get(hoverSquare).type === 'p' && (i === 0 || i === 7)) {
												setSelectingPromotion(true);
												setLastMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
												setPromotionMousePosition({ x: mousePosition.x, y: mousePosition.y });
												return;
											}
											onMove({ from: hoverSquare, to: SQUARES[8 * i + j] });
										}
										setHoverSquare(null);
									}
								}}
							>
								{hoverSquare && boardState.moves({ square: hoverSquare }).some(move => move.includes(SQUARES[8 * i + j])) ? (
									<div draggable={false} className="absolute bg-blue-500 bg-opacity-50 pointer-events-none" style={{ width: size, height: size }} />
								) : null}
								{boardState && boardState.get(SQUARES[8 * i + j]) && (hoverSquare !== SQUARES[8 * i + j] || touching) ? (
									<Piece
										type={boardState.get(SQUARES[8 * i + j]).type}
										color={boardState.get(SQUARES[8 * i + j]).color}
										width={size}
										height={size}
										props={{ style: { pointerEvents: 'none', userSelect: 'none' } }}
									/>
								) : null}
							</div>
						))}
					</div>
				))
			}

			{selectingPromotion ? promotionMenu({ onSelect: onSelectPromotion, color: color, position: promotionMousePosition, move: lastMove, size: size }) : null}
		</div>
	);
};