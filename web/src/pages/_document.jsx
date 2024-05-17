import { Head, Html, Main, NextScript } from 'next/document';
import { DocumentHeadTags, documentGetInitialProps } from '@mui/material-nextjs/v13-pagesRouter';


export default function Document(props) {

	return (
		<>
			<Html lang="en">
				<Head>
					<DocumentHeadTags {...props} />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		</>
	);
}
