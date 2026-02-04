"use client";

import { Fugaz_One, Inter, Noto_Sans_JP } from "next/font/google";
import Image from "next/image";
import { useCallback } from "react";

import { useMotionPermissionStore } from "@/components/shake/motion-permission-store";

type ShakeMarkProps = {
	className?: string;
	isShaking?: boolean;
	remainingCount?: number;
};

const SHAKE_TEXT_GRADIENT =
	"linear-gradient(136.896deg, rgb(194, 232, 18) 21.042%, rgb(255, 127, 17) 40.344%, rgb(238, 66, 102) 101.73%)";
const REMAINING_TEXT_GRADIENT =
	"linear-gradient(119.056deg, rgb(194, 232, 18) 21.042%, rgb(255, 127, 17) 40.344%, rgb(238, 66, 102) 101.73%), linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 100%)";

const fugazOne = Fugaz_One({
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});
const inter = Inter({
	subsets: ["latin"],
	weight: ["700", "900"],
	display: "swap",
});
const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["700", "900"],
	display: "swap",
});
const INTER_JP_FONT_FAMILY = `${inter.style.fontFamily}, ${notoSansJP.style.fontFamily}, sans-serif`;

export function ShakeMark({
	className,
	isShaking = false,
	remainingCount = 0,
}: ShakeMarkProps) {
	const { permissionState, requestPermission } = useMotionPermissionStore();
	const shouldPromptPermission = !isShaking && permissionState === "prompt";
	const isPermissionDenied = !isShaking && permissionState === "denied";
	const canRequestPermission = shouldPromptPermission && !!requestPermission;
	const rootClassName = ["relative size-[258px] shrink-0", className ?? ""]
		.join(" ")
		.trim();
	const displayCount = remainingCount;
	const headlineText = shouldPromptPermission
		? "TOUCH!!"
		: isPermissionDenied
			? "RESTART"
			: "SHAKE!!";

	const handleRequestPermission = useCallback(() => {
		if (!canRequestPermission) {
			return;
		}
		requestPermission?.("user");
	}, [canRequestPermission, requestPermission]);

	return (
		<button
			className={[
				rootClassName,
				"appearance-none border-0 bg-transparent p-0 text-left",
				canRequestPermission ? "cursor-pointer" : "",
			]
				.join(" ")
				.trim()}
			type="button"
			aria-label="モーション権限を付与"
			disabled={!canRequestPermission}
			onClick={handleRequestPermission}
		>
			<div className="absolute left-1/2 top-1/2 size-[258.656px] -translate-x-1/2 -translate-y-1/2">
				<Image
					alt=""
					src="/shake/shake-mark.svg"
					width={259}
					height={259}
					className="h-full w-full"
					preload={true}
				/>
			</div>
			<div className="absolute inset-[0_-0.19%] flex flex-col items-center justify-center gap-3 text-center">
				<div
					className={
						`${fugazOne.className} flex h-[28.005px] w-[191.843px] flex-col justify-center leading-0 not-italic ` +
						(isShaking
							? "text-[#c9c9c9] text-[24px] tracking-[1.44px]"
							: "bg-clip-text text-[36.985px] text-transparent tracking-[2.2191px]")
					}
					style={
						isShaking
							? undefined
							: {
									backgroundImage: SHAKE_TEXT_GRADIENT,
									WebkitTextFillColor: "transparent",
								}
					}
				>
					<p className="leading-normal whitespace-pre-wrap">{headlineText}</p>
				</div>
				<div
					className={
						isShaking
							? "flex h-[53.858px] w-[191.843px] flex-col justify-center bg-clip-text text-[0px] text-transparent tracking-[2.2191px]"
							: "whitespace-nowrap text-[14px] font-bold leading-normal text-(--text-secondary,#ccc)"
					}
					style={
						isShaking
							? {
									backgroundImage: REMAINING_TEXT_GRADIENT,
									WebkitTextFillColor: "transparent",
									fontVariationSettings: "'wght' 700",
									fontFamily: INTER_JP_FONT_FAMILY,
								}
							: { fontFamily: INTER_JP_FONT_FAMILY }
					}
				>
					{isShaking ? (
						<p className="whitespace-pre-wrap">
							<span className="text-[24px] font-black leading-normal">
								あと
							</span>
							<span className="text-[64px] leading-normal">{displayCount}</span>
							<span className="text-[24px] font-black leading-normal">回</span>
						</p>
					) : shouldPromptPermission ? (
						<>
							<p>ここを押して</p>
							<p>権限を付与</p>
						</>
					) : isPermissionDenied ? (
						<>
							<p>権限が拒否されました</p>
							<p>アプリを再起動してください</p>
						</>
					) : (
						<>
							<p>シェイクで</p>
							<p>チェーンに参加！</p>
						</>
					)}
				</div>
				{isShaking ? (
					<p
						className="text-[14px] font-bold leading-normal text-[rgba(30,30,30,0.24)]"
						style={{ fontFamily: INTER_JP_FONT_FAMILY }}
					>
						スマホをシェイク!!
					</p>
				) : null}
			</div>
		</button>
	);
}
