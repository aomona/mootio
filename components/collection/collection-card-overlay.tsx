"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Inter, Noto_Sans_JP } from "next/font/google";

import { CardRender } from "@/components/card-render";

type CollectionCardOverlayProps = {
	open: boolean;
	cardId: string | null;
	count: number;
	onClose: () => void;
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

const resolveCount = (count: number) => {
	if (!Number.isFinite(count) || count <= 0) {
		return 1;
	}
	return Math.floor(count);
};

export function CollectionCardOverlay({
	open,
	cardId,
	count,
	onClose,
	animate = true,
}: CollectionCardOverlayProps) {
	const shouldReduceMotion = useReducedMotion();
	const displayCount = resolveCount(count);
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
					className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center overflow-y-auto bg-[rgba(0,0,0,0.64)] backdrop-blur-[12px]"
					{...motionConfig}
				>
					<div className="flex w-full max-w-[420px] flex-col items-center justify-center gap-[16px] px-[24px] py-[48px]">
						<p
							className="text-center text-[20px] font-bold leading-[22px] text-white"
							style={{ fontFamily: TEXT_FONT_FAMILY }}
						>
							カードを獲得しました！
						</p>
						<p
							className="text-center text-[16px] font-bold text-white"
							style={{ fontFamily: TEXT_FONT_FAMILY }}
						>
							獲得枚数: {displayCount}枚
						</p>
						<CardRender
							cardId={cardId ?? ""}
							fallback={cardFallback}
							className="shrink-0"
						/>
						<button
							type="button"
							onClick={onClose}
							className="relative flex w-[247px] items-center justify-center overflow-clip rounded-[999px] border-2 border-[rgba(253,255,252,0.24)] bg-white py-[24px]"
						>
							<span
								className="text-[16px] font-bold leading-[22px] text-[#ff7f11]"
								style={{ fontFamily: TEXT_FONT_FAMILY }}
							>
								閉じる
							</span>
							<span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_24px_0px_rgba(253,255,252,0.96)]" />
						</button>
					</div>
				</motion.div>
			) : null}
		</AnimatePresence>
	);
}
