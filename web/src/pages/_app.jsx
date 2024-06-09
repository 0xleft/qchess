import '@/styles/globals.css';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { AppCacheProvider } from '@mui/material-nextjs/v13-pagesRouter';

import RootLayout from '@/components/Layout';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, createTheme } from '@mui/material';

const darkTheme = createTheme({
	palette: {
	  	mode: 'dark',
	},
});

export default function App({ Component, pageProps }) {
	return (
		<AppCacheProvider>
			<SessionProvider session={pageProps.session}>
				<ThemeProvider theme={darkTheme}>
					<RootLayout>
						<Component {...pageProps} />
					</RootLayout>
				</ThemeProvider>
			</SessionProvider>
		</AppCacheProvider>
	)
}