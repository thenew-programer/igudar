import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/components/auth/AuthProvider';

const inter = Inter({
	subsets: ['latin'],
	display: 'swap',
	variable: '--font-inter',
});

export const metadata: Metadata = {
	title: 'IGUDAR - Moroccan Real Estate Investment Platform',
	description: 'Fractional real estate investment platform for Morocco. Invest in premium properties and build your wealth through shared ownership.',
	keywords: ['real estate', 'investment', 'Morocco', 'fractional ownership', 'property investment'],
	authors: [{ name: 'IGUDAR Team' }],
	creator: 'IGUDAR',
	publisher: 'IGUDAR',
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1,
		},
	},
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: 'https://igudar.com',
		title: 'IGUDAR - Moroccan Real Estate Investment Platform',
		description: 'Fractional real estate investment platform for Morocco. Invest in premium properties and build your wealth through shared ownership.',
		siteName: 'IGUDAR',
	},
	twitter: {
		card: 'summary_large_image',
		title: 'IGUDAR - Moroccan Real Estate Investment Platform',
		description: 'Fractional real estate investment platform for Morocco. Invest in premium properties and build your wealth through shared ownership.',
		creator: '@igudar',
	},
	// viewport: {
	//   width: 'device-width',
	//   initialScale: 1,
	//   maximumScale: 1,
	// },
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" className={inter.variable}>
			<head>
				<link rel="icon" href="/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
				<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
				<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
				{/*<link rel="manifest" href="/site.webmanifest" />*/}
				<meta name="theme-color" content="#5d18e9" />
				<meta name="msapplication-TileColor" content="#5d18e9" />
			</head>
			<body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
				<AuthProvider>
					<div id="root">
						{children}
					</div>
				</AuthProvider>
			</body>
		</html>
	);
}
