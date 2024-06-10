import Chessboard from "@/components/chess/Chessboard";
import { ArrowRight, ArrowRightAlt, Sports, SportsEsports } from "@mui/icons-material";
import { Button } from "@mui/material";
import { tsParticles } from "@tsparticles/engine";
import { Chess } from "chess.js";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Index() {
	const router = useRouter();
	const [boardState, setBoardState] = useState(new Chess());

	function createGame(color) {
		fetch(`http://localhost:2425/ws/create?private=${false}&random=${false}&time=${300}&increment=${0}`)
		.then(res => res.json())
		.then(data => {
			router.push(`/play/${data.id}/${data[color === 'w' ? 'whiteId' : 'blackId']}?otherId=${data[color === 'w' ? 'blackId' : 'whiteId']}`);
		}).catch(err => {
			console.error(err);
		});
	}
	  

	return (
		<>
			<div className="h-[50vh] md:h-[70vh] lg:flex-row flex-col text-center items-center justify-center gap-2 lg:gap-20 mt-10 lg:mt-20 hidden md:flex">
				<div className="flex flex-col items-center justify-center gap-2 lg:gap-5">
					<h1 className="text-4xl md:text-6xl font-bold text-center w-full">
						Play chess
					</h1>
					<h2 className="lg:hidden">Enjoy simple chess network while being able to play anonymously without creating an account.</h2>

					<Button
						className="lg:hidden flex"
						variant="contained"
						color="primary"
						startIcon={<SportsEsports />}
						onClick={
							() => {
								document.getElementById('chessboard').scrollIntoView({ behavior: 'smooth' });
							}
						}
					>
						Play now
					</Button>

					<Button className="hidden lg:flex" variant="contained" color="primary" startIcon={<SportsEsports />} href="/play">
						Play now
					</Button>
				</div>
				
				<div className="lg:flex flex-col items-center justify-center gap-2 hidden">
					<Chessboard boardState={boardState} playing={true} onSelect={(piece) => {
						createGame(boardState.get(piece).color);
					}} />

					Make a move with the side you would like to play as.
				</div>
			</div>

			<div className="flex justify-center items-center w-full flex-col gap-4 mt-20 lg:hidden" id="chessboard">
				<Chessboard boardState={boardState} playing={true} onSelect={(piece) => {
					createGame(boardState.get(piece).color);
				}} />

				Make a move with the side you would like to play as.
			</div>

			<div className="flex flex-col items-center justify-center gap-4 mt-20 h-[300px]">
			</div>
		</>
	);
}
