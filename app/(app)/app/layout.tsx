import Image from "next/image";
import { NavBar } from "@/components/nav-bar";

export default function Nav({ children }: { children: React.ReactNode }) {
	return (
		<>
			<Image
				alt=""
				src={"/signup/bg-pattern.svg"}
				className="pointer-events-none absolute left-1/2 top-87.5 max-w-110 -translate-x-1/2 -translate-y-1/2 w-full"
				width={420}
				height={420}
			/>
			{children}
			<div className="fixed bottom-10 left-1/2 -translate-x-1/2">
				<NavBar />
			</div>
		</>
	);
}
