import { Inter, Noto_Sans_JP } from "next/font/google";
import Image, { type StaticImageData } from "next/image";
import type { CSSProperties, ReactNode } from "react";

type AvatarImage = {
	src: string | StaticImageData;
	alt?: string;
	imageClassName?: string;
	imageStyle?: CSSProperties;
};

type ChainDialogProps = {
	className?: string;
	type?: "some" | "first";
	avatars?: AvatarImage[];
	message?: ReactNode;
	messageLines?: [string, string];
	count?: number;
	topUserName?: string;
	firstLabel?: string;
	firstContent?: ReactNode;
	starsSrc?: string | StaticImageData;
	starsAlt?: string;
};

const inter = Inter({
	subsets: ["latin"],
	weight: ["500"],
	display: "swap",
});
const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["500"],
	display: "swap",
});
const TEXT_FONT_FAMILY = `${inter.style.fontFamily}, ${notoSansJP.style.fontFamily}, sans-serif`;

const DEFAULT_AVATARS: AvatarImage[] = [
	{
		src: "https://www.figma.com/api/mcp/asset/10c2dd5e-b03a-4fcb-ab6f-485cf2e5b3af",
		imageStyle: {
			height: "234.87%",
			left: "-110.98%",
			top: "-31.71%",
			width: "329.24%",
		},
	},
	{
		src: "https://www.figma.com/api/mcp/asset/3febe968-efa2-487f-a497-a9049418d263",
		imageStyle: {
			height: "133.34%",
			left: "0%",
			top: "0%",
			width: "100%",
		},
	},
	{
		src: "https://www.figma.com/api/mcp/asset/10b7c1d9-370d-49ba-b055-a1ac07c9df7d",
		imageStyle: {
			height: "133.34%",
			left: "0%",
			top: "0%",
			width: "100%",
		},
	},
];
const DEFAULT_MESSAGE_LINES: [string, string] = [
	"hasizumeと他3人が",
	"このチェーンに参加しています",
];
const DEFAULT_FIRST_LABEL = "一番乗り！";
const DEFAULT_STARS_SRC =
	"https://www.figma.com/api/mcp/asset/c171cda8-293c-4a03-88de-4c310a7d0ccf";
const FALLBACK_AVATAR_STYLE: CSSProperties = {
	height: "100%",
	left: "0%",
	objectFit: "cover",
	top: "0%",
	width: "100%",
};

const buildMessageLines = (
	count: number,
	topUserName: string,
): [string, string] => {
	if (count <= 0) {
		return DEFAULT_MESSAGE_LINES;
	}
	const resolvedName = topUserName.trim() ? topUserName : "だれか";
	if (count === 1) {
		return [`${resolvedName}が`, "このチェーンに参加しています"];
	}
	const others = Math.max(0, count - 1);
	return [`${resolvedName}と他${others}人が`, "このチェーンに参加しています"];
};

const isRemoteSrc = (src: string | StaticImageData) =>
	typeof src === "string" && src.startsWith("http");

export function ChainDialog({
	className,
	type = "some",
	avatars = DEFAULT_AVATARS,
	message,
	messageLines,
	count,
	topUserName = "",
	firstLabel = DEFAULT_FIRST_LABEL,
	firstContent,
	starsSrc = DEFAULT_STARS_SRC,
	starsAlt = "",
}: ChainDialogProps) {
	const isFirst = type === "first";
	const isSome = type === "some";
	const rootClassName = [
		"border border-[rgba(255,255,255,0.24)] border-solid content-stretch flex items-center overflow-clip relative rounded-[333px] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)] max-w-[300px]",
		isFirst
			? "bg-gradient-to-b from-[#d78528] via-[#e5852b] via-[50.481%] to-[#efc119] gap-[24px] h-[48px] px-[24px] py-[12px]"
			: "bg-[var(--bg-invert,#1e1e1e)] h-[47.999px]",
		className ?? "",
	]
		.join(" ")
		.trim();
	const resolvedMessageLines =
		messageLines ??
		(typeof count === "number"
			? buildMessageLines(count, topUserName)
			: DEFAULT_MESSAGE_LINES);
	const messageContent = message ?? (
		<>
			<p className="mb-0">{resolvedMessageLines[0]}</p>
			<p>{resolvedMessageLines[1]}</p>
		</>
	);
	const firstContentNode = firstContent ?? firstLabel;
	const visibleAvatars = avatars.slice(0, 3);
	const avatarCount = visibleAvatars.length;
	const avatarStackWidth = avatarCount > 0 ? 48 + (avatarCount - 1) * 24 : 0;

	return (
		<div className={rootClassName}>
			{isSome ? (
				<>
					{avatarCount > 0 ? (
						<div
							className="h-[47.999px] relative shrink-0"
							style={{ width: avatarStackWidth }}
						>
							{visibleAvatars.map((avatar, index) => (
								<div
									key={`${index}-${avatar.src}`}
									className="absolute border-4 border-[#1e1e1e] border-solid h-[47.999px] rounded-[333px] top-0 w-[48px]"
									style={{ left: index * 24, zIndex: index + 1 }}
								>
									<div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[333px]">
										<Image
											alt={avatar.alt ?? ""}
											src={avatar.src}
											width={48}
											height={48}
											unoptimized={isRemoteSrc(avatar.src)}
											className={[
												"absolute max-w-none",
												avatar.imageClassName ?? "",
											]
												.join(" ")
												.trim()}
											style={{
												...FALLBACK_AVATAR_STYLE,
												...avatar.imageStyle,
											}}
										/>
									</div>
								</div>
							))}
						</div>
					) : null}
					<div className="content-stretch flex items-center justify-center px-[12px] relative shrink-0">
						<div
							className="font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white whitespace-nowrap"
							style={{ fontFamily: TEXT_FONT_FAMILY }}
						>
							{messageContent}
						</div>
					</div>
				</>
			) : null}
			{isFirst ? (
				<>
					{starsSrc ? (
						<div className="relative shrink-0 size-[24px]">
							<Image
								alt={starsAlt}
								src={starsSrc}
								width={24}
								height={24}
								unoptimized={isRemoteSrc(starsSrc)}
								className="block max-w-none size-full"
							/>
						</div>
					) : null}
					<p
						className="font-medium leading-[normal] not-italic relative shrink-0 text-[12px] text-white"
						style={{ fontFamily: TEXT_FONT_FAMILY }}
					>
						{firstContentNode}
					</p>
				</>
			) : null}
		</div>
	);
}
