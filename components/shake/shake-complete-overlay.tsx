import { Fugaz_One, Inter, Noto_Sans_JP } from "next/font/google";
import Image from "next/image";

type ShakeCompleteOverlayProps = {
	open: boolean;
	animate?: boolean;
	rank: number | null;
	onDrawCard: () => void;
};

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
const TEXT_FONT_FAMILY = `${inter.style.fontFamily}, ${notoSansJP.style.fontFamily}, sans-serif`;
const RANK_GRADIENT =
	"linear-gradient(119.056deg, rgb(194, 232, 18) 21.042%, rgb(255, 127, 17) 40.344%, rgb(238, 66, 102) 101.73%)";
const CARD_ICON_SRC = "/icons/card-icon.svg";

export function ShakeCompleteOverlay({
	open,
	animate = true,
	rank,
	onDrawCard,
}: ShakeCompleteOverlayProps) {
	if (!open) {
		return null;
	}

	const rootClassName = [
		"fixed inset-0 z-50 flex flex-col items-center justify-center gap-[24px]",
		"backdrop-blur-[12px] bg-[rgba(0,0,0,0.64)]",
		animate
			? "motion-safe:animate-[shake-complete-in_240ms_ease-out_both]"
			: "transition-none",
	]
		.join(" ")
		.trim();
	const hasRank = typeof rank === "number" && Number.isFinite(rank);

	return (
		<div className={rootClassName}>
			<div className="flex flex-col items-center justify-center gap-[24px]">
				<div className="relative flex size-[258px] items-center justify-center">
					<Image
						alt=""
						src="/shake/shake-mark.svg"
						width={259}
						height={259}
						className="absolute inset-0 size-full"
						priority={true}
					/>
					<div className="relative z-10 flex flex-col items-center justify-center text-center">
						<p
							className={`${fugazOne.className} text-[24px] tracking-[1.44px] text-[#c9c9c9]`}
						>
							SHAKE!!
						</p>
						{hasRank ? (
							<>
								<p className="mt-[4px] flex items-baseline justify-center gap-[4px]">
									<span
										className="bg-clip-text text-[48px] font-black leading-none text-transparent"
										style={{
											backgroundImage: RANK_GRADIENT,
											WebkitTextFillColor: "transparent",
											fontFamily: TEXT_FONT_FAMILY,
										}}
									>
										{rank}
									</span>
									<span
										className="bg-clip-text text-[20px] font-bold leading-none text-transparent"
										style={{
											backgroundImage: RANK_GRADIENT,
											WebkitTextFillColor: "transparent",
											fontFamily: TEXT_FONT_FAMILY,
										}}
									>
										番目
									</span>
								</p>
								<p
									className="mt-[6px] text-[14px] font-bold text-[rgba(30,30,30,0.64)]"
									style={{ fontFamily: TEXT_FONT_FAMILY }}
								>
									に参加しました
								</p>
							</>
						) : (
							<p
								className="mt-[10px] text-[14px] font-bold text-[rgba(30,30,30,0.64)]"
								style={{ fontFamily: TEXT_FONT_FAMILY }}
							>
								参加しました
							</p>
						)}
					</div>
				</div>
				<button
					type="button"
					onClick={onDrawCard}
					className="relative flex w-[247px] items-center justify-center gap-[16px] overflow-clip rounded-[999px] border-2 border-[rgba(253,255,252,0.24)] bg-white py-[24px]"
				>
					<Image
						alt=""
						src={CARD_ICON_SRC}
						width={24}
						height={24}
						className="size-[24px]"
						unoptimized={true}
					/>
					<span
						className="text-[16px] font-bold leading-[22px] text-[#ff7f11]"
						style={{ fontFamily: TEXT_FONT_FAMILY }}
					>
						カードを引く
					</span>
					<span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_24px_0px_rgba(253,255,252,0.96)]" />
				</button>
			</div>
		</div>
	);
}
