import NextNProgress from 'nextjs-progressbar';
import Navbar from './Navbar';

export default function RootLayout({ children }) {
	return (
        <>
            <Navbar />

            <main className="min-h-screen">
                <>
                    <NextNProgress color={'#2196f3'}
                        startPosition={0.3} stopDelayMs={200} height={3} showOnShallow={true} options={
                        { showSpinner: false }
                    } />
                    {children}
                </>
            </main>
		</>
    );
};