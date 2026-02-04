import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";

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
				<div className=" fixed -z-1 w-screen h-screen  bg-[linear-gradient(176deg,#C2E812_2.43%,#FF7F11_63.35%,#EE4266_87.27%)]"></div>
				<div className="is_pwa">{children}</div>
				<div className="is_not_pwa relative min-h-screen w-full">
					<div className=" absolute left-1/2 top-[47%] grid -translate-x-1/2 -translate-y-1/2 place-items-center w-[90%] max-w-[600px] h-[40%] bg-white rounded-2xl p-6">
						<h1 className="text-center text-2xl font-semibold text-black">
							アプリをインストールして
							<br />
							ください。
						</h1>
						<p className="mt-4 text-center text-black/70">
							このWebサイトを
							<br />
							ホーム画面に追加して起動してください。
						</p>
					</div>
				</div>
			</body>
		</html>
	);
}
