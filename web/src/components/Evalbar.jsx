import { Paper } from "@mui/material";

export default function Evalbar({ score, turn, className = "" }) {
    console.log(score);
    if (String(score).includes("Mate")) {
        return null;
    }

    score = parseInt(score) * (turn === "w" ? 1 : -1);

    const whiteWidth = 50 + (score / 1500) * 50;
    const blackWidth = 50 - (score / 1500) * 50;

	return (
		<div className={className}>
            <div className="flex flex-row">
                <Paper className="bg-white h-2 transition-all" style={{ width: `${whiteWidth}%` }} />
                <Paper className="bg-black h-2 transition-all" style={{ width: `${blackWidth}%` }} />
            </div>
		</div>
	);
};