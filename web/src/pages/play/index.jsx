import Chessboard from '@/components/chess/AnalysisChessboard';
import { Box, Button, Container, Divider, FormControlLabel, Hidden, Radio, RadioGroup, Select, Switch } from '@mui/material';
import { Chess } from 'chess.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useEffect, useState } from 'react';

export default function PlayIndex() {

	const [isPrivate, setIsPrivate] = useState(false);
	const [color, setColor] = useState('random');
	const [page, setPage] = useState(0);

	const [publicGames, setPublicGames] = useState([]);

	useEffect(() => {
		fetch('http://localhost:2425/ws/public')
			.then(res => res.json())
			.then(data => {
				setPublicGames(Object.values(data || {}).map(i => JSON.parse(i)));
			});
	}, []);

	function createGame() {
		fetch('http://localhost:2425/ws/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				'isPrivate': isPrivate,
				'random': color === 'random',
			})
		})
		.then(res => res.json())
		.then(data => {
			console.log(data);
		});
	}

	return (
		<>
			<Container maxWidth='md' className='mt-5'>
				<Box className='flex justify-between items-center'>
					<Button variant='contained' color='primary' className='w-full' onClick={createGame}>
						Create
					</Button>
				</Box>
				<Box className='flex justify-between items-center mt-5'>
					<div>
						<Switch checked={isPrivate} onChange={() => setIsPrivate(!isPrivate)} />
						<span>Private</span>
					</div>

					<div>
						<RadioGroup
							row
							defaultValue="random"
							value={color}
							onChange={(e) => setColor(e.target.value)}
						>
							<FormControlLabel value="random" control={<Radio />} label="Random" />
							<FormControlLabel value="white" control={<Radio />} label="White" />
							<FormControlLabel value="black" control={<Radio />} label="Black" />
						</RadioGroup>
					</div>
				</Box>

				<Divider className='mt-5 mb-5' />

				<TableContainer component={Paper}>
					<Table aria-label="Avaliable public games">
						<TableBody>
						{Object.values(publicGames).map((i, row) => (
							<TableRow
							className='h-10'
							key={row.name}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
							<TableCell component="th" scope="row">
								<Link href={`/play/${row.id}/${row.joinId}`}>
									<Button variant='contained' color='primary' asChild>
										Join
									</Button>
								</Link>
								
							</TableCell>
							<TableCell>{row.random}</TableCell>
							<TableCell align="right">{row.time}</TableCell>
							<TableCell align="right">{row.created}</TableCell>
							</TableRow>
						))}
						</TableBody>
					</Table>

					<Box className='flex justify-between items-center'>
						<div className='flex flex-row justify-center items-center w-full'>
							<Button variant='text' color='primary'>
								More
							</Button>
						</div>
					</Box>
				</TableContainer>
			</Container>
		</>
	)
}