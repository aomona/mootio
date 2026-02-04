"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Inter, Noto_Sans_JP } from "next/font/google";

import { CardRender } from "@/components/card-render";

type ShakeCardOverlayProps = {
	open: boolean;
	cardId: string | null;
	onLike: () => void;
	animate?: boolean;
};

const inter = Inter({
	subsets: ["latin"],
	weight: ["700"],
	display: "swap",
});
const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["700"],
	display: "swap",
});
const TEXT_FONT_FAMILY = `${inter.style.fontFamily}, ${notoSansJP.style.fontFamily}, sans-serif`;

export function ShakeCardOverlay({
	open,
	cardId,
	onLike,
	animate = true,
}: ShakeCardOverlayProps) {
	const shouldReduceMotion = useReducedMotion();
	const cardFallback = (
		<p
			className="text-center text-[14px] font-bold text-white"
			style={{ fontFamily: TEXT_FONT_FAMILY }}
		>
			カード情報を取得できませんでした
		</p>
	);
	const shouldAnimate = animate && !shouldReduceMotion;
	const motionConfig = shouldAnimate
		? {
				initial: { opacity: 0, scale: 0.98, y: 8 },
				animate: { opacity: 1, scale: 1, y: 0 },
				exit: { opacity: 0, scale: 0.98, y: 8 },
				transition: { duration: 0.25, ease: "easeOut" },
			}
		: {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				transition: { duration: 0.2 },
			};

	return (
		<AnimatePresence>
			{open ? (
				<motion.div
					className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center overflow-y-auto backdrop-blur-[12px] bg-[rgba(0,0,0,0.64)]"
					{...motionConfig}
				>
					<div className="flex w-full max-w-[420px] flex-col items-center justify-center gap-[24px] px-[24px] py-[48px]">
						<p
							className="text-center text-[20px] font-bold leading-[22px] text-white"
							style={{ fontFamily: TEXT_FONT_FAMILY }}
						>
							カードを獲得しました！
						</p>
						<CardRender
							cardId={cardId ?? ""}
							fallback={cardFallback}
							className="shrink-0"
						/>
						<button
							type="button"
							onClick={onLike}
							className="relative flex w-[247px] items-center justify-center overflow-clip rounded-[999px] border-2 border-[rgba(253,255,252,0.24)] bg-white py-[24px]"
						>
							<span
								className="text-[16px] font-bold leading-[22px] text-[#ff7f11]"
								style={{ fontFamily: TEXT_FONT_FAMILY }}
							>
								いいね！
							</span>
							<span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_24px_0px_rgba(253,255,252,0.96)]" />
						</button>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
