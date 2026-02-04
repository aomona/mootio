import { Inter, Noto_Sans_JP } from "next/font/google";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

type ChainUserCardFollowState = "none" | "following" | "first";

type ChainUserCardProps = {
	className?: string;
	name: string;
	rank: number | string;
	avatarSrc: string | StaticImageData;
	avatarAlt?: string;
	profileHref?: string;
	followState?: ChainUserCardFollowState;
	followingLabel?: string;
	firstLabel?: string;
	avatarImageClassName?: string;
	avatarImageStyle?: CSSProperties;
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
const FALLBACK_AVATAR_STYLE: CSSProperties = {
	height: "100%",
	left: "0%",
	objectFit: "cover",
	top: "0%",
	width: "100%",
};

const isRemoteSrc = (src: string | StaticImageData) =>
	typeof src === "string" && src.startsWith("http");

export function ChainUserCard({
	className,
	name,
	rank,
	avatarSrc,
	avatarAlt = "",
	profileHref,
	followState = "none",
	followingLabel = "フォロー中",
	firstLabel = "一番乗り！",
	avatarImageClassName,
	avatarImageStyle,
}: ChainUserCardProps) {
	const isFollowing = followState === "following";
	const isFirst = followState === "first";
	const showLabel = isFollowing || isFirst;
	const resolvedRank = typeof rank === "number" ? `#${rank}` : rank;
	const rootClassName = [
		"content-stretch flex gap-[12px] items-center relative",
		profileHref ? "cursor-pointer" : "",
	]
		.join(" ")
		.trim();
	const cardClassName = [
		"border border-solid content-stretch flex h-[47.999px] items-center overflow-clip relative rounded-[333px] shrink-0",
		isFirst
			? "bg-gradient-to-b border-[#ffe3a8] from-[#d78528] via-[#e5852b] via-[50.481%] to-[#efc119] shadow-[0px_4px_24px_0px_#ffe169]"
			: isFollowing
				? "bg-gradient-to-b border-[rgba(255,255,255,0.48)] from-[#1260e8] via-[#2ba296] via-[50.481%] to-[#31a4b8] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.25)]"
				: "bg-[var(--bg-invert,#1e1e1e)] border-[rgba(255,255,255,0.24)]",
	]
		.join(" ")
		.trim();
	const avatarClassName = [
		"border-4 border-solid h-[47.999px] relative rounded-[333px] shrink-0 w-[48px]",
		isFirst
			? "border-[#d78528]"
			: isFollowing
				? "border-[#1260e8]"
				: "border-[var(--bg-invert,#1e1e1e)]",
	]
		.join(" ")
		.trim();
	const nameClassName =
		"font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-[color:var(--text-invert,white)]";
	const labelClassName =
		"font-bold leading-[normal] not-italic relative shrink-0 text-[12px] text-[color:var(--text-invert,white)]";
	const rankClassName =
		"font-bold leading-[normal] not-italic relative shrink-0 text-[16px] text-[color:var(--text-primary,#1e1e1e)]";

	const content = (
		<>
			<div className={cardClassName}>
				<div className={avatarClassName}>
					<div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[333px]">
						<Image
							alt={avatarAlt}
							src={avatarSrc}
							width={48}
							height={48}
							unoptimized={isRemoteSrc(avatarSrc)}
							className={["absolute max-w-none", avatarImageClassName ?? ""]
								.join(" ")
								.trim()}
							style={{
								...FALLBACK_AVATAR_STYLE,
								...avatarImageStyle,
							}}
						/>
					</div>
				</div>
				<div className="content-stretch flex items-center justify-center px-[24px] relative shrink-0">
					<p className={nameClassName} style={{ fontFamily: TEXT_FONT_FAMILY }}>
						{name}
					</p>
				</div>
				{showLabel ? (
					<>
						<div className="content-stretch flex flex-col h-[48px] items-start p-[4px] relative shrink-0">
							<div className="bg-[var(--bg-transparent,rgba(255,255,255,0.12))] content-stretch flex flex-[1_0_0] items-center min-h-px min-w-px px-[12px] relative rounded-[333px]">
								<p
									className={labelClassName}
									style={{ fontFamily: TEXT_FONT_FAMILY }}
								>
									{isFirst ? firstLabel : followingLabel}
								</p>
							</div>
						</div>
						<div
							className={[
								"absolute inset-0 pointer-events-none rounded-[inherit]",
								isFirst
									? "shadow-[inset_0px_0px_24px_0px_#faef79]"
									: "shadow-[inset_0px_0px_24px_0px_rgba(253,255,252,0.96)]",
							]
								.join(" ")
								.trim()}
						/>
					</>
				) : null}
			</div>
			<p className={rankClassName} style={{ fontFamily: TEXT_FONT_FAMILY }}>
				{resolvedRank}
			</p>
		</>
	);

	if (profileHref) {
		return (
			<Link
				href={profileHref}
				className={rootClassName}
				aria-label={`${name}のプロフィールへ`}
			>
				{content}
			</Link>
		);
	}

	return <div className={rootClassName}>{content}</div>;
}
