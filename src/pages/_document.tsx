import {Html, Head, Main, NextScript} from 'next/document.js';

const Document = () => {
	return (
		<Html lang='en'>
			<Head>
				{/* Favicon */}
				<link
					rel='apple-touch-icon'
					sizes='180x180'
					href='/favicon/apple-touch-icon.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='32x32'
					href='/favicon/favicon-32x32.png'
				/>
				<link
					rel='icon'
					type='image/png'
					sizes='16x16'
					href='/favicon/favicon-16x16.png'
				/>
				<link rel='manifest' href='/favicon/site.webmanifest' />
				{/* Google Fonts */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link rel='preconnect' href='https://fonts.gstatic.com' />
				<link
					href='https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap'
					rel='stylesheet'
				/>
			</Head>
			<body className='min-h-screen min-w-screen'>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
};

export default Document;
