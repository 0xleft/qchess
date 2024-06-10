import { Paper } from "@mui/material";
import { DigitalClock } from "@mui/x-date-pickers";
import { useEffect } from "react";

export default function Clock({ time, color, dimmed }) {
	let hours = Math.floor(time / 3600);
	let minutes = Math.floor((time % 3600) / 60);
	let seconds = time % 60;

	let hoursString = hours < 10 ? `0${hours}` : `${hours}`;
	let minutesString = minutes < 10 ? `0${minutes}` : `${minutes}`;
	let secondsString = seconds < 10 ? `0${seconds}` : `${seconds}`;

	return (
		<>
			<Paper className={`min-h-10 min-w-20 p-4 bg-${color} text-${color === "white" ? "black" : "white"} ${dimmed ? "bg-opacity-50 opacity-50" : ""}`}>
				<h1 className="text-4xl text-center">{`${hoursString}:${minutesString}:${secondsString}`}</h1>
			</Paper>
		</>
	)
}