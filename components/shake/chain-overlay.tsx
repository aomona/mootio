import { Inter, Noto_Sans_JP } from "next/font/google";
import Image from "next/image";
import { ChainUserCard } from "@/components/chain-user-card";
import { ChainDialog } from "@/components/shake/chain-dialog";

type ChainOverlayUser = {
	id: string;
	name: string;
	image: string;
	rank: number;
	is_following: boolean;
};

type ChainOverlayLabel = {
	count: number;
	top_user_name: string;
	top_user_icon: string;
	icons: string[];
};

type ChainOverlayProps = {
	open: boolean;
	animate: boolean;
	onClose: () => void;
	onDialogToggle: () => void;
	showBackButton: boolean;
	canToggle?: boolean;
	users: ChainOverlayUser[];
	myRank: number | null;
	label?: ChainOverlayLabel | null;
	isEmpty?: boolean;
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

export function ChainOverlay({
	open,
	animate,
	onClose,
	onDialogToggle,
	showBackButton,
	canToggle = true,
	users,
	myRank,
	label,
	isEmpty = false,
}: ChainOverlayProps) {
	if (!open) {
		return null;
	}

	const avatarSources = label?.icons?.filter((icon) => !!icon) ?? [];
	const avatars =
		avatarSources.length > 0
			? avatarSources.map((src) => ({ src }))
			: undefined;
	const dialogType = !label || isEmpty ? "first" : "some";
	const rootClassName = [
		"relative min-h-screen w-full",
		"bg-gradient-to-b from-[#c2e812] via-[#ff7f11] via-[50%] to-[#ee4266]",
		"overflow-y-auto",
		animate
			? "motion-safe:animate-[chain-overlay-in_240ms_ease-out_both]"
			: "transition-none",
	]
		.join(" ")
		.trim();

	return (
		<div className={rootClassName}>
			<Image
				alt=""
				src="/signup/bg-pattern.svg"
				width={680}
				height={680}
				className="pointer-events-none absolute left-1/2 top-1/2 w-[680px] -translate-x-1/2 -translate-y-1/2 opacity-60"
				aria-hidden="true"
			/>
			<div className="relative flex min-h-screen flex-col gap-[48px] px-[24px] pb-[140px] pt-[64px]">
				<div
					className={[
						"flex items-start gap-[12px]",
						showBackButton ? "justify-start" : "w-full justify-center",
					]
						.join(" ")
						.trim()}
				>
					{showBackButton ? (
						<button
							type="button"
							onClick={onClose}
							className="flex size-[48px] items-center justify-center rounded-[999px] border border-[rgba(255,255,255,0.24)] bg-[#1e1e1e] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)]"
							aria-label="戻る"
						>
							<svg
								width="20"
								height="20"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
							>
								<path
									d="M15 6L9 12L15 18"
									stroke="white"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</button>
					) : null}
					<button
						type="button"
						onClick={onDialogToggle}
						disabled={!canToggle}
						aria-disabled={!canToggle}
						className={[
							"border-0 bg-transparent p-0",
							canToggle ? "cursor-pointer" : "cursor-default",
						]
							.join(" ")
							.trim()}
						aria-label={canToggle ? "チェーンを閉じる" : "チェーン"}
					>
						<ChainDialog
							type={dialogType}
							avatars={avatars}
							count={label?.count}
							topUserName={label?.top_user_name}
						/>
					</button>
				</div>
				{myRank !== null ? (
					<p
						className="font-bold text-[#1e1e1e] text-center"
						style={{ fontFamily: TEXT_FONT_FAMILY }}
					>
						<span className="text-[16px]">今日は</span>
						<span className="text-[32px]">{myRank}</span>
						<span className="text-[16px]">番目に参加しました！</span>
					</p>
				) : null}
				{isEmpty ? (
					<p
						className="font-bold text-[16px] text-[#1e1e1e] text-center"
						style={{ fontFamily: TEXT_FONT_FAMILY }}
					>
						今日は静かでした....
					</p>
				) : (
					<div className="relative w-full">
						<div className="absolute left-[22px] top-0 h-full w-[4px] bg-[#1e1e1e]" />
						<div className="flex flex-col gap-[16px]">
							{users.map((userItem) => (
								<ChainUserCard
									key={userItem.id}
									name={userItem.name}
									rank={userItem.rank}
									avatarSrc={userItem.image || "/icon512_rounded.png"}
									avatarAlt={userItem.name}
									profileHref={`/app/profile/${userItem.id}`}
									followState={
										userItem.rank === 1
											? "first"
											: userItem.is_following
												? "following"
												: "none"
									}
								/>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
