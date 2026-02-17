import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaGuard from "@/components/pwaGuard";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Mootio",
	description: "Mootio App",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja">
			<body
				className={`${geistSans.variable} ${geistMono.variable} min-h-screen text-zinc-900 antialiased bg-[#C2E812]`}
			>
				<div className="fixed -z-1 w-screen h-screen bg-[linear-gradient(176deg,#C2E812_2.43%,#FF7F11_63.35%,#EE4266_87.27%)]"></div>
				<PwaGuard>{children}</PwaGuard>
			</body>
		</html>
	);
}
