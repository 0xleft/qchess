"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Box, Divider, IconButton, List, ListItem, ListItemButton, ListItemIcon } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Drawer from '@mui/material/Drawer';

export default function Navbar() {
    const [mobileDrawerOpen, setMobileDrawerOpen] = React.useState(false);

    const toggleMobileDrawer = (newOpen) => () => {
        setMobileDrawerOpen(newOpen);
    };

    const MobileDrawerList = (
        <Box sx={{ width: 250 }} role="presentation" onClick={toggleMobileDrawer(false)}>
            <List>
                <ListItemButton href='/auth/login'>
                    Login
                </ListItemButton>
                <ListItemButton href='/auth/register'>
                    Register
                </ListItemButton>
            </List>
            <Divider />
            <List>
            </List>
        </Box>
    );
    
	return (
        <>
            <header className='text-primary body-font shadow'>
			<div className='mx-auto flex flex-wrap p-2 flex-row md:flex-row items-center justify-between ml-3 mr-3'>
				<div className='flex flex-row items-center space-x-2'>
                    <Link href='/' className="pr-4">
                        <Image src='/LightPawn.webp' alt='logo' width={50} height={50} />
                    </Link>

                    <Divider orientation='vertical' flexItem color='white' />

                    <Link href='/play' className="pl-5 font-thin text-xl pr-5 hover:text-[#2196f3]">
                        Play
                    </Link>

                    <Link href='/analysis' className="text-xl font-thin pr-5 hover:text-[#2196f3]">
                        Analyze
                    </Link>
				</div>
				<div className='md:flex items-center space-x-2 flex-row flex'>
                    <Button onClick={toggleMobileDrawer(true)} className='block md:hidden' variant='contained' color='primary'
                    >
                        More
                    </Button>
                    <div className='hidden md:flex items-center space-x-2'>
                        <Drawer open={mobileDrawerOpen} onClose={toggleMobileDrawer(false)}>
                            {MobileDrawerList}
                        </Drawer>
                        <Button variant='contained' color='primary' href='/auth/login'>
                            Login
                        </Button>
                        <Button variant='outlined' color='primary' href='/auth/register'>
                            Register
                        </Button>
                    </div>
				</div>
			</div>
		</header>
		</>
    );
};