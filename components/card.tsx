export const CARD_GRADIENTS = {
	rare: {
		gradientClassName:
			"from-[#1260e8] via-[#0e9cb5] via-[50.481%] to-[#0a8276]",
		glowColor: "#85d1f2",
	},
	epic: {
		gradientClassName:
			"from-[#a362ae] via-[#6f0eb5] via-[50.481%] to-[#2a217f]",
		glowColor: "#dc96e8",
	},
	legend: {
		gradientClassName:
			"from-[#d78528] via-[#e5852b] via-[50.481%] to-[#efc119]",
		glowColor: "#efb619",
	},
	knowledge: {
		gradientClassName:
			"from-[#75c053] via-[#157f7f] via-[50.481%] to-[#a1bf1b]",
		glowColor: "#efec19",
	},
} as const;

export type CardGradientName = keyof typeof CARD_GRADIENTS;

export type CardVariant = "exercise" | "knowledge";

const CARD_STAR_SIZES = {
	rare: { width: 85.375, height: 29.117 },
	epic: { width: 115.167, height: 29.117 },
	legend: { width: 144.959, height: 29.117 },
} as const;

type BaseCardProps = {
	className?: string;
	gradient: CardGradientName;
	title: string;
	description: string;
	backgroundSrc: string;
	backgroundAlt?: string;
	pictogramSrc: string;
	pictogramAlt?: string;
};

type ExerciseCardProps = BaseCardProps & {
	variant: "exercise";
	starIconSrc: string;
	starIconAlt?: string;
	pictogramOverlaySrc?: string;
	pictogramOverlayAlt?: string;
};

type KnowledgeCardProps = BaseCardProps & {
	variant: "knowledge";
	headerLabel: string;
};

export type CardProps = ExerciseCardProps | KnowledgeCardProps;

export function Card(props: CardProps) {
	const {
		className,
		gradient,
		title,
		description,
		backgroundSrc,
		backgroundAlt = "",
		pictogramSrc,
		pictogramAlt = "",
		variant,
	} = props;
	const gradientStyles = CARD_GRADIENTS[gradient];
	const innerGlow = `inset 0px 0px 64px 0px ${gradientStyles.glowColor}`;
	const boxShadow =
		variant === "exercise"
			? `0px 24px 48px 0px rgba(0,0,0,0.25), ${innerGlow}`
			: innerGlow;
	const starSize =
		gradient in CARD_STAR_SIZES
			? CARD_STAR_SIZES[gradient as keyof typeof CARD_STAR_SIZES]
			: CARD_STAR_SIZES.rare;
	const rootClassName = [
		"relative flex h-[500px] w-[340px] flex-col items-center justify-between overflow-hidden rounded-[36px] border-[12px] border-solid border-white bg-gradient-to-b p-[36px]",
		gradientStyles.gradientClassName,
		className ?? "",
	]
		.join(" ")
		.trim();

	const headerNode =
		variant === "exercise" ? (
			<div className="flex w-full flex-col items-end">
				<div
					className="shrink-0"
					style={{ width: starSize.width, height: starSize.height }}
				>
					<img
						alt={props.starIconAlt ?? ""}
						className="block size-full max-w-none"
						src={props.starIconSrc}
					/>
				</div>
			</div>
		) : (
			<div className="flex w-full flex-col items-end">
				<p className="w-full whitespace-pre-wrap text-center font-['Inter:Bold','Noto_Sans_JP:Bold',sans-serif] text-[20px] font-bold leading-[1.5] text-white">
					{props.headerLabel}
				</p>
			</div>
		);

	const pictogramNode =
		variant === "exercise" ? (
			<div className="relative h-[169.651px] w-[240px] shrink-0">
				<img
					alt={pictogramAlt}
					className="block size-full max-w-none drop-shadow-[0px_4px_24px_rgba(0,0,0,0.12)]"
					src={pictogramSrc}
				/>
				{props.pictogramOverlaySrc ? (
					<div className="absolute -left-[10%] -right-[10%] -top-[14.14%] -bottom-[14.15%]">
						<img
							alt={props.pictogramOverlayAlt ?? ""}
							className="block size-full max-w-none"
							src={props.pictogramOverlaySrc}
						/>
					</div>
				) : null}
			</div>
		) : (
			<div className="relative h-[169.651px] w-[240px] shrink-0">
				<div className="absolute left-0 right-0 -top-[31.34%] -bottom-[36.06%]">
					<img
						alt={pictogramAlt}
						className="block size-full max-w-none"
						src={pictogramSrc}
					/>
				</div>
			</div>
		);

	return (
		<div className={rootClassName} style={{ boxShadow }}>
			<div className="absolute left-1/2 top-1/2 h-[408.697px] w-[339.998px] -translate-x-1/2 -translate-y-1/2">
				<img
					alt={backgroundAlt}
					className="block size-full max-w-none"
					src={backgroundSrc}
				/>
			</div>
			{headerNode}
			{pictogramNode}
			<div className="flex w-[278.174px] flex-col items-start gap-[12px] whitespace-pre-wrap text-white">
				<p className="w-full font-['Inter:Bold','Noto_Sans_JP:Bold',sans-serif] text-[24px] font-bold leading-[1.5]">
					{title}
				</p>
				<p className="w-full font-['Inter:Medium','Noto_Sans_JP:Regular',sans-serif] text-[14px] font-medium leading-[1.5]">
					{description}
				</p>
			</div>
		</div>
	);
}
