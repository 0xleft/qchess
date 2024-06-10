import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import RestoreIcon from '@mui/icons-material/Restore';
import { useState } from 'react';
import { Home, PlayArrow } from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function BottomNav() {
    const [value, setValue] = useState(0);
    const router = useRouter();

	return (
        <>
            <Box className="w-full fixed bottom-0">
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                        router.push(newValue);
                    }}
                >
                    <BottomNavigationAction label="Home" value="/" icon={<Home />} />
                    <BottomNavigationAction label="Play" value="/play" icon={<PlayArrow />} />
                    <BottomNavigationAction label="Explore" value="/explore" icon={<RestoreIcon />} />
                </BottomNavigation>
            </Box>
		</>
    );
};