import Image from "next/image";
export default function Home() {
	return (
		<div className="bg-black w-screen h-screen">
			<div className="flex items-center w-full h-full justify-center">
				<div className="flex items-center flex-col">
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
				</div>
			</div>
		</div>
	);
}
