import NextNProgress from 'nextjs-progressbar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { Hidden } from '@mui/material';

export default function RootLayout({ children }) {
	return (
        <>
            <Hidden mdDown>
                <Navbar />
            </Hidden>

            <main className="overflow-hidden md:overflow-visible lg:mt-10 mt-10 md:mt-2">
                <>
                    <NextNProgress color={'#2196f3'}
                        startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} options={
                        { showSpinner: false }
                    } />
                    {children}
                </>
            </main>

            <Hidden mdUp>
                <BottomNav />
            </Hidden>
		</>
    );
};