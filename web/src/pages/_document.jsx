import { Head, Html, Main, NextScript } from 'next/document';
import { DocumentHeadTags, documentGetInitialProps } from '@mui/material-nextjs/v13-pagesRouter';


export default function Document(props) {

	return (
		<>
			<Html lang="en">
				<Head>
					<DocumentHeadTags {...props} />
					<meta name="description" content="A free chess platform that allows you to play chess with your friends." />
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		</>
	);
}
