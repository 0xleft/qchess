import { Paper } from "@mui/material";

export default function Movelist({ moves, highlight, onClick = () => {}, className = "" }) {
	const whiteMoves = moves.filter((_, i) => i % 2 === 0);
	const blackMoves = moves.filter((_, i) => i % 2 !== 0);

	return (
		<div className={className}>
			<div className="grid grid-cols-3 gap-1 p-4">
				<div>
					{whiteMoves.map((_, i) => (
						<div key={i} className="text-sm">
							{i + 1}
						</div>
					))}
				</div>
				<div>
					{whiteMoves.map((move, i) => (
						<div key={i} className="text-sm">{move}</div>
					))}
				</div>
				<div>
					{blackMoves.map((move, i) => (
						<div key={i} className="text-sm">{move}</div>
					))}
				</div>
			</div>
		</div>
	);
};