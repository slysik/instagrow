import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
	subsets: ["latin"],
	variable: "--font-inter",
});

export const metadata: Metadata = {
	title: "InstaGrow - Create Amazing Instagram Content in One Click",
	description:
		"Save 2+ hours per week creating quality Instagram content. 8 AI tools to supercharge your growth.",
	keywords: [
		"Instagram",
		"content creation",
		"AI",
		"social media",
		"marketing",
		"business",
	],
	openGraph: {
		title: "InstaGrow - Create Amazing Instagram Content in One Click",
		description:
			"Save 2+ hours per week creating quality Instagram content. 8 AI tools to supercharge your growth.",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${inter.variable} font-sans antialiased`}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
