import Image from "next/image";
export default function Home() {
	return (
		<div className="bg-black w-screen h-screen">
			<div className="flex items-center w-full h-full justify-center">
				<div className="flex items-center flex-col p-2">
					<Image
						src="/images/shake/f2d5e329-0736-463e-817a-3b3269b6acc2.svg"
						alt="Logo"
						width={100}
						height={100}
						className="mb-10"
					/>
					<p className="text-white text-2xl ml-4 text-center">
						このページをホーム画面に追加、もしくはインストールを行なって開いてください。
					</p>
					<p className="text-white ml-4 text-center mt-4">
						IOSの場合はSafariの共有メニューから「ホーム画面に追加」を選択してください。
					</p>
					<p className="text-white ml-4 text-center mt-2">
						Androidの場合はChromeのメニューから「ホーム画面に追加」もしくは「インストール」を選択してください。
					</p>
				</div>
			</div>
		</div>
	);
}
