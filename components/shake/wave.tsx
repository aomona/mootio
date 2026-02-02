import Image from "next/image";

type WaveProps = {
	className?: string;
};

export function Wave({ className }: WaveProps) {
	const rootClassName = ["relative size-[538.257px] shrink-0", className ?? ""]
		.join(" ")
		.trim();

	return (
		<div className={rootClassName} aria-hidden="true">
			<div className="absolute inset-[0.66%] shake-wave-rotate">
				<Image
					alt=""
					src="/shake/wave.svg"
					width={531}
					height={531}
					className="h-full w-full"
				/>
			</div>
			<div className="absolute inset-[14.98%] shake-wave-rotate-reverse">
				<div className="absolute inset-[0.94%]">
					<Image
						alt=""
						src="/shake/wave-inner.svg"
						width={370}
						height={370}
						className="h-full w-full"
					/>
				</div>
			</div>
		</div>
	);
}
