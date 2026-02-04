const FALLBACK_TROPHY_SRC =
	"https://www.figma.com/api/mcp/asset/1d2e8748-df04-4ea0-b10b-b043bf5caa2f";

type TrophyCardProps = {
	thumbnailSrc: string | null;
	title: string;
	awardedAt?: string | null;
	className?: string;
};

type TrophyDateParts = {
	monthDay: string;
	year: string;
};

const formatTrophyDate = (value?: string | null): TrophyDateParts | null => {
	if (!value) {
		return null;
	}
	const parsed = new Date(value);
	if (Number.isNaN(parsed.getTime())) {
		return null;
	}
	const month = String(parsed.getMonth() + 1).padStart(2, "0");
	const day = String(parsed.getDate()).padStart(2, "0");
	return {
		monthDay: `${month}/${day}`,
		year: String(parsed.getFullYear()),
	};
};

export function TrophyCard({
	thumbnailSrc,
	title,
	awardedAt,
	className,
}: TrophyCardProps) {
	const dateParts = formatTrophyDate(awardedAt);
	const resolvedThumbnail = thumbnailSrc || FALLBACK_TROPHY_SRC;
	const rootClassName = [
		"relative flex h-[150px] w-[120px] items-center overflow-hidden rounded-[24px] border border-[rgba(255,255,255,0.24)] bg-[#1e1e1e] py-[8px] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)]",
		className ?? "",
	]
		.join(" ")
		.trim();

	return (
		<div className={rootClassName}>
			<div className="relative h-[131.606px] w-[120px] shrink-0">
				<div className="absolute inset-0 overflow-hidden">
					<img
						alt={title}
						className="absolute left-[-48.37%] top-0 h-full w-[194.97%] max-w-none object-cover"
						src={resolvedThumbnail}
					/>
				</div>
				<div className="absolute inset-0 rounded-[inherit] shadow-[inset_0px_3.664px_7.328px_0px_rgba(255,255,255,0.64)]" />
			</div>
			{dateParts ? (
				<div className="absolute bottom-[-1px] left-[-1px] right-[-1px] flex h-[74px] flex-col items-center justify-end overflow-hidden bg-gradient-to-b from-[rgba(30,30,30,0)] via-[rgba(30,30,30,0.47)] via-[22.115%] to-[#1e1e1e] to-[47.115%] py-[12px] font-['Inter:Bold',sans-serif] font-bold leading-[normal]">
					<p className="text-[16px] text-white">{dateParts.monthDay}</p>
					<p className="text-[12px] text-[rgba(255,255,255,0.64)]">
						{dateParts.year}
					</p>
				</div>
			) : null}
		</div>
	);
}
