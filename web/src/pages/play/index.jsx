import { Box, Button, Container, Divider, FormControlLabel, Hidden, Radio, RadioGroup, Select, Slider, Switch } from '@mui/material';
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
import LoadingButton from '@mui/lab/LoadingButton';

const timeMarks = [
	{
	  value: 1,
	  label: '1min',
	},
	{
	  value: 20,
	  label: '20mins',
	},
	{
	  value: 60,
	  label: '1hr',
	},
];

const incrementMarks = [
	{
		value: 1,
		label: '1s',
	},
	{
		value: 5,
		label: '5s',
	},
	{
		value: 10,
		label: '10s',
	},
	{
		value: 30,
		label: '30s',
	},
]

export default function PlayIndex() {

	const router = useRouter();

	const [isPrivate, setIsPrivate] = useState(false);
	const [color, setColor] = useState('random');
	const [page, setPage] = useState(0);
	const [loading, setLoading] = useState(false);

	const [time, setTime] = useState(5);
	const [increment, setIncrement] = useState(5);

	const [publicGames, setPublicGames] = useState([]);

	function getPublicList(page) {
		setLoading(true);
		fetch(`/api/ws/public?skip=${page * 10}`)
			.then(res => res.json())
			.then(data => {
				if (!data || Object.keys(data).length === 0) {
					setPage(page - 1);
					setLoading(false);
					return;
				}
				setPublicGames([...publicGames, ...Object.values(data || {}).map(i => JSON.parse(i))]);
				setLoading(false);
				setPage(page);
			}).catch(err => {
				console.error(err);
				setLoading(false);
			});
	}

	useEffect(() => {
		getPublicList(page);
	}, []);

	function createGame() {
		fetch(`/api/ws/create?private=${isPrivate}&color=${color}&random=${color === 'random'}&time=${time * 60}&increment=${increment}`)
		.then(res => res.json())
		.then(data => {
			let tempColor = color;
			if (tempColor === 'random') {
				const random = Math.floor(Math.random() * 2);
				tempColor = random === 0 ? 'white' : 'black';
			}
			router.push(`/play/${data.id}/${data[tempColor + 'Id']}?otherId=${data[tempColor === 'white' ? 'blackId' : 'whiteId']}`);
		}).catch(err => {
			console.error(err);
		});
	}

	return (
		<>
			<Container maxWidth='md' className='mt-5 mb-20'> {/* big margin at bottom for phone screens */}
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
				<Box className='flex justify-between items-center mt-5 w-full'>
					<Slider
						aria-label="Time"
						defaultValue={5}
						onChange={(e, value) => setTime(value)}
						valueLabelDisplay="auto"
						step={1}
						marks={timeMarks}
						min={1}
						max={60}
					/>
				</Box>
				<Box className='flex justify-between items-center mt-5 w-full'>
					<Slider
						aria-label="Increment"
						defaultValue={5}
						onChange={(e, value) => setIncrement(value)}
						valueLabelDisplay="auto"
						step={1}
						marks={incrementMarks}
						min={1}
						max={30}
					/>
				</Box>

				<Divider className='mt-5 mb-5' />

				<TableContainer component={Paper}>
					<Table aria-label="Avaliable public games">
						<TableBody>
						{publicGames.length === 0 && (
							<TableRow>
								<TableCell colSpan={4} align='center'>There are no public games at this time :(</TableCell>
							</TableRow>
						)}
						{Object.values(publicGames).map((row) => (
							<TableRow
							className='h-10'
							key={row.name}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
							<TableCell component="th" scope="row">
								<Link href={`/play/${row.id}/${row.whiteId || row.blackId}`}>
									<Button variant='contained' color={row.whiteId === "" ? 'primary' : 'info'}>
										Join as {row.whiteId === "" ? 'black' : 'white'}
									</Button>
								</Link>
							</TableCell>
							<TableCell component="th" scope="row">
								<Link href={`/play/${row.id}/spectate`}>
									<Button variant='contained' color={row.whiteId === "" ? 'primary' : 'info'}>
										Spectate
									</Button>
								</Link>
							</TableCell>
							<TableCell align="right">{(row.whiteTime / 60).toFixed(0)}min + {row.increment}s</TableCell>
							<TableCell align="right">{row.created}</TableCell>
							</TableRow>
						))}
						</TableBody>
					</Table>

					<Box className='flex justify-between items-center'>
						<div className='flex flex-row justify-center items-center w-full'>
							<LoadingButton loading={loading} variant='text' color='primary' onClick={() => getPublicList(page + 1)}>
								More
							</LoadingButton>
						</div>
					</Box>
				</TableContainer>
			</Container>
		</>
	)
}