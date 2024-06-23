import Chessboard, { Color } from "@/components/chess/Chessboard";
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
		fetch(`/api/ws/public`)
			.then(res => res.json())
			.then(data => {
				if (data) {
					Object.values(data || {}).map(i => JSON.parse(i)).forEach(game => {
						if (game.whiteId === null && color === Color.WHITE || game.blackId === null && color === Color.BLACK) {
							return;
						}
	
						router.push(`/play/${game.id}/${game[color === 'w' ? 'whiteId' : 'blackId']}?otherId=${game[color === 'w' ? 'blackId' : 'whiteId']}`);
						return;
					});
				}

				fetch(`/api/ws/create?private=${false}&random=${color === "random"}&time=${300}&increment=${0}`)
				.then(res => res.json())
				.then(data => {
					router.push(`/play/${data.id}/${data[color === 'w' ? 'whiteId' : 'blackId']}?otherId=${data[color === 'w' ? 'blackId' : 'whiteId']}`);
				}).catch(err => {
					console.error(err);
				});
			}).catch(err => {
				console.error(err);
			});
	}

	return (
		<>
			<title>QChess</title>

			<div className="h-[100vh] md:h-[70vh] lg:flex-row flex-col text-center items-center justify-center gap-2 lg:gap-20 mt-10 lg:mt-20 hidden lg:flex fixed lg:relative">
				<div className="flex flex-col items-center justify-center gap-2 lg:gap-5">
					<h1 className="text-4xl md:text-6xl font-bold text-center w-full">
						Play chess
					</h1>
					<h2 className="lg:hidden">Enjoy simple chess network while being able to play anonymously without creating an account.</h2>

					<Button variant="contained" color="primary" startIcon={<SportsEsports />} onClick={() => {
						createGame('random');
					}}>
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

			<div className="flex justify-center items-center w-full flex-col gap-4 mt-20 lg:hidden fixed" id="chessboard">
				<div className="fixed items-center flex flex-col gap-4">
					<h1 className="text-5xl md:text-6xl font-bold text-center w-full">
						Play chess
					</h1>

					<Button variant="contained" color="primary" startIcon={<SportsEsports />} href="/play">
						Play now
					</Button>
				</div>

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
