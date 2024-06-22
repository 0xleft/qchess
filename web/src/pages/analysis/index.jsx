import prisma from "@/lib/prisma"
import { LoadingButton } from "@mui/lab"
import { Box, Button, Container, Paper, Table, TableBody, TableCell, TableContainer, TableRow } from "@mui/material"
import Link from "next/link"
import { useState } from "react"

export async function getServerSideProps() {
	
	const games = await prisma.chessGame.findMany({
		take: 10,
		orderBy: {
			playedAt: 'desc'
		}
	})

	return {
		props: {
			games: games.map((game) => ({
				gameId: game.gameId,
				winner: game.winner,
				playedAt: game.playedAt.toString(),
				moves: game.moves
			}))
		}
	}
}

export default function AnalysisIndex(props) {
	const [loading, setLoading] = useState(false);

	const [page, setPage] = useState(0);
	const [games, setGames] = useState(props.games);

	function getMoreGames(page) {
		setLoading(true);

		fetch(`/api/games?page=${page}`).then((res) => res.json()).then((data) => {
			if (data.length === 0) {
				return;
			}
			setPage(page);
			setGames((games) => [...games, ...data]);
		}).catch((err) => {
			console.error(err);
		}).finally(() => {
			setLoading(false);
		});
	}
	
	return (
		<>
			<title>Analysis</title>

			<Container maxWidth='md'>
				<TableContainer component={Paper}>
					<Table aria-label="Avaliable public games">
						<TableBody>
							<TableRow
								className='h-10'
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<TableCell component="th" scope="row">
								</TableCell>
								<TableCell align="right">Winner</TableCell>
								<TableCell align="right">Opening</TableCell>
								<TableCell align="right">Played at</TableCell>
							</TableRow>

							{games.map((row) => (
								<TableRow
									className='h-10'
									key={row.gameId}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										<Link href={`/analysis/${row.gameId}`}>
											<Button variant='contained' color='primary'>
												View
											</Button>
										</Link>
									</TableCell>
									<TableCell align="right">{row.winner}</TableCell>
									<TableCell align="right">{row.moves[0]}</TableCell>
									<TableCell align="right">{getTimeAgo(row.playedAt)}</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>

					<Box className='flex justify-between items-center'>
						<div className='flex flex-row justify-center items-center w-full'>
							<LoadingButton loading={loading} variant='text' color='primary' onClick={() => getMoreGames(page + 1)}>
								More
							</LoadingButton>
						</div>
					</Box>
				</TableContainer>
			</Container>
		</>
	)

	function getTimeAgo(date) {
		const now = new Date();
		const playedAt = new Date(date);
		const diff = now - playedAt;
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const months = Math.floor(days / 30);
		const years = Math.floor(months / 12);

		if (years > 0) {
			return `${years} year${years > 1 ? 's' : ''} ago`;
		} else if (months > 0) {
			return `${months} month${months > 1 ? 's' : ''} ago`;
		} else if (days > 0) {
			return `${days} day${days > 1 ? 's' : ''} ago`;
		} else if (hours > 0) {
			return `${hours} hour${hours > 1 ? 's' : ''} ago`;
		} else if (minutes > 0) {
			return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
		} else {
			return 'Just now';
		}
	}
}