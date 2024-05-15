import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Navbar() {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
	return (
        <>
            <header className='text-primary body-font shadow'>
			<div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
				<div className='flex flex-row items-center space-x-2'>
                    <Link href='/' className="border-r pr-5">
                        <Image src='/LightPawn.webp' alt='logo' width={50} height={50} />
                    </Link>

                    <Link href='/play' className="pl-5 font-bold text-xl pr-5 hover:text-[#2196f3]">
                        Play
                    </Link>

                    <Link href='/play' className="text-xl font-thin pr-5 hover:text-[#2196f3]">
                        Analyze
                    </Link>
				</div>
				<div className='md:flex items-center space-x-2 flex-row flex'>
                    <Button variant='contained' color='primary' href='/auth/login'>
                        Login
                    </Button>
                    <Button variant='outlined' color='primary' href='/auth/register'>
                        Register
                    </Button>
				</div>
			</div>
		</header>
		</>
    );
};