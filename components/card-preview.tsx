import { CARD_GRADIENTS, type CardGradientName } from "@/components/card";

const IMG_CARD_PREVIEW_BG =
	"https://www.figma.com/api/mcp/asset/9e71871f-9d15-405e-9d02-3a8fafb2440c";
const IMG_CARD_PREVIEW_PICTOGRAM =
	"https://www.figma.com/api/mcp/asset/b3faa059-e05d-483e-a049-6cff8b63caaf";

type CardPreviewGradient = CardGradientName | "legendary";

type CardPreviewProps = {
	gradient: CardPreviewGradient;
	unionSrc: string;
	className?: string;
	backgroundSrc?: string;
	backgroundAlt?: string;
	pictogramSrc?: string;
	pictogramAlt?: string;
	unionAlt?: string;
};

const resolveGradient = (gradient: CardPreviewGradient): CardGradientName =>
	gradient === "legendary" ? "legend" : gradient;

export function CardPreview({
	gradient,
	unionSrc,
	className,
	backgroundSrc = IMG_CARD_PREVIEW_BG,
	backgroundAlt = "",
	pictogramSrc = IMG_CARD_PREVIEW_PICTOGRAM,
	pictogramAlt = "",
	unionAlt = "",
}: CardPreviewProps) {
	const resolvedGradient = resolveGradient(gradient);
	const gradientStyles = CARD_GRADIENTS[resolvedGradient];
	const rootClassName = [
		"relative flex h-[210px] w-[160px] flex-col items-center justify-center gap-[24px] overflow-hidden rounded-[36px] bg-gradient-to-b p-[36px] shadow-[0px_24px_48px_0px_rgba(0,0,0,0.25)] ring-8 ring-white",
		gradientStyles.gradientClassName,
		className ?? "",
	]
		.join(" ")
		.trim();

	return (
		<div className={rootClassName}>
			<div className="absolute left-1/2 top-1/2 h-[192.329px] w-[160px] -translate-x-1/2 -translate-y-1/2">
				<img
					alt={backgroundAlt}
					className="block size-full max-w-none"
					src={backgroundSrc}
				/>
			</div>
			<div className="relative h-[72.081px] w-[101.971px] shrink-0">
				<div className="absolute inset-0">
					<img
						alt=""
						aria-hidden="true"
						className="block size-full max-w-none blur-[1.7px] opacity-70 drop-shadow-[0px_1.7px_10.197px_rgba(0,0,0,0.12)]"
						src={pictogramSrc}
					/>
				</div>
				<img
					alt={pictogramAlt}
					className="block size-full max-w-none"
					src={pictogramSrc}
				/>
				<div className="absolute inset-[-14.14%_-10%_-14.15%_-10%]">
					<img
						alt={unionAlt}
						className="block size-full max-w-none"
						src={unionSrc}
					/>
				</div>
			</div>
			<div
				className="pointer-events-none absolute inset-0 rounded-[inherit]"
				style={{
					boxShadow: `inset 0px 0px 64px 0px ${gradientStyles.glowColor}`,
				}}
			/>
		</div>
	);
}
