"use client";

import { Camera } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";

type ProfileCardVariant = "has-follow" | "mine" | "editing" | "following";

type ProfileCardProps = {
	className?: string;
	variant?: ProfileCardVariant;
	type?: ProfileCardVariant;
	name: string;
	bio: string;
	avatarSrc: string;
	avatarAlt?: string;
	isAvatarEditable?: boolean;
	onAvatarChange?: (file: File) => void;
	avatarInputAriaLabel?: string;
	avatarActionLabel?: string;
	followersCount?: number | string;
	followingCount?: number | string;
	followersLabel?: string;
	followingLabel?: string;
	followButtonLabel?: string;
	followingButtonLabel?: string;
	isFollowDisabled?: boolean;
	onFollowClick?: () => void;
	onEditClick?: () => void;
	editAriaLabel?: string;
	editIcon?: ReactNode;
	editIconActive?: ReactNode;
	nameValue?: string;
	bioValue?: string;
	onNameChange?: (value: string) => void;
	onBioChange?: (value: string) => void;
	namePlaceholder?: string;
	bioPlaceholder?: string;
};

const DefaultEditIcon = ({ className }: { className?: string }) => (
	<svg
		aria-hidden="true"
		className={className}
		fill="none"
		height="24"
		viewBox="0 0 24 24"
		width="24"
	>
		<path
			d="M4 16.75V20h3.25L18.81 8.44l-3.25-3.25L4 16.75Z"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.6"
		/>
		<path
			d="M14.55 5.44 16.9 3.1a1.5 1.5 0 0 1 2.12 0l1.88 1.88a1.5 1.5 0 0 1 0 2.12l-2.34 2.34"
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="1.6"
		/>
	</svg>
);

export function ProfileCard({
	className,
	variant,
	type,
	name,
	bio,
	avatarSrc,
	avatarAlt = "",
	isAvatarEditable = false,
	onAvatarChange,
	avatarInputAriaLabel = "プロフィール画像を変更",
	avatarActionLabel = "画像変更",
	followersCount = 0,
	followingCount = 0,
	followersLabel = "フォロワー",
	followingLabel = "フォロー中",
	followButtonLabel = "フォロー",
	followingButtonLabel = "フォロー中",
	isFollowDisabled = false,
	onFollowClick,
	onEditClick,
	editAriaLabel = "プロフィールを編集",
	editIcon,
	editIconActive,
	nameValue,
	bioValue,
	onNameChange,
	onBioChange,
	namePlaceholder = name,
	bioPlaceholder = bio,
}: ProfileCardProps) {
	const resolvedVariant = variant ?? type ?? "has-follow";
	const isEditing = resolvedVariant === "editing";
	const isFollowing = resolvedVariant === "following";
	const showStats = ["has-follow", "mine", "following"].includes(
		resolvedVariant,
	);
	const showActionButton = ["has-follow", "following"].includes(
		resolvedVariant,
	);
	const showEditButton = ["mine", "editing"].includes(resolvedVariant);
	const rootClassName = [
		"relative flex w-[345px] flex-col items-start",
		className ?? "",
	]
		.join(" ")
		.trim();
	const followLabel = isFollowing ? followingButtonLabel : followButtonLabel;
	const activeEditIcon = editIconActive ?? editIcon;
	const resolvedEditIcon = isEditing
		? (activeEditIcon ?? <DefaultEditIcon className="size-6" />)
		: (editIcon ?? <DefaultEditIcon className="size-6" />);
	const resolvedName = nameValue ?? name;
	const resolvedBio = bioValue ?? bio;
	const showAvatarControl = isAvatarEditable && !!onAvatarChange;
	const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.currentTarget.files?.[0];
		if (file) {
			onAvatarChange?.(file);
		}
		event.currentTarget.value = "";
	};

	return (
		<div className={rootClassName}>
			<div className="h-12 w-full" aria-hidden="true" />
			<div className="relative w-full rounded-[36px] border border-[rgba(255,255,255,0.24)] bg-[var(--bg-invert,#1e1e1e)] px-6 pb-6 pt-[64px] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)]">
				<div
					className={
						isEditing
							? "flex w-full flex-col gap-3 pt-[43px]"
							: "flex flex-col gap-1"
					}
				>
					{isEditing ? (
						<>
							<div className="w-full rounded-[12px] bg-[var(--bg-transparent,rgba(255,255,255,0.12))] px-4 py-4">
								<input
									aria-label="Name"
									className="w-full bg-transparent text-[16px] font-medium leading-normal text-white placeholder:text-[#bbb] focus:outline-none"
									placeholder={namePlaceholder}
									readOnly={!onNameChange}
									value={resolvedName}
									onChange={(event) =>
										onNameChange?.(event.currentTarget.value)
									}
								/>
							</div>
							<div className="w-full rounded-[12px] bg-[var(--bg-transparent,rgba(255,255,255,0.12))] px-4 py-4">
								<input
									aria-label="Bio"
									className="w-full bg-transparent text-[16px] font-medium leading-normal text-white placeholder:text-[#bbb] focus:outline-none"
									placeholder={bioPlaceholder}
									readOnly={!onBioChange}
									value={resolvedBio}
									onChange={(event) => onBioChange?.(event.currentTarget.value)}
								/>
							</div>
						</>
					) : (
						<>
							<p className="text-[20px] font-bold leading-[1.5] text-[color:var(--text-invert,white)]">
								{name}
							</p>
							<p className="text-[14px] font-medium leading-[1.5] text-[color:var(--text-invert,white)]">
								{bio}
							</p>
						</>
					)}
				</div>
				{showStats ? (
					<div className="mt-4 flex w-full items-center gap-2.5 overflow-hidden">
						<div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[12px] bg-[var(--bg-transparent,rgba(255,255,255,0.12))] py-3 text-center text-white">
							<p className="min-w-full font-['SF_Pro_Display',sans-serif] text-[24px] font-bold leading-[1.5]">
								{followersCount}
							</p>
							<p className="text-[12px] font-bold leading-[1.5]">
								{followersLabel}
							</p>
						</div>
						<div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-[12px] bg-[var(--bg-transparent,rgba(255,255,255,0.12))] py-3 text-center text-white">
							<p className="min-w-full font-['SF_Pro_Display',sans-serif] text-[24px] font-bold leading-[1.5]">
								{followingCount}
							</p>
							<p className="text-[12px] font-bold leading-[1.5]">
								{followingLabel}
							</p>
						</div>
					</div>
				) : null}
				{showActionButton ? (
					<button
						aria-pressed={isFollowing || undefined}
						className={[
							"relative mt-4 w-full rounded-[12px] border-2 border-[rgba(253,255,252,0.24)] py-6 text-center text-[16px] font-bold leading-[22px] text-[color:var(--text-primary,#1e1e1e)] transition",
							isFollowing
								? "bg-[linear-gradient(180deg,#c2e812_0%,#ff7f11_50%,#ee4266_100%)]"
								: "bg-[var(--bg-surface,white)]",
							isFollowDisabled ? "cursor-not-allowed opacity-70" : "",
						]
							.join(" ")
							.trim()}
						disabled={isFollowDisabled}
						onClick={onFollowClick}
						type="button"
					>
						{followLabel}
						<span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_24px_0px_rgba(253,255,252,0.96)]" />
					</button>
				) : null}
				<div className="group absolute left-[23px] top-[-49px] h-[96px] w-[96px] overflow-hidden rounded-full border-4 border-[var(--bg-invert,#1e1e1e)] bg-[var(--bg-invert,#1e1e1e)]">
					<img
						alt={avatarAlt}
						className="h-full w-full object-cover"
						src={avatarSrc}
					/>
					{showAvatarControl ? (
						<label className="absolute bottom-1 right-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-[rgba(0,0,0,0.65)] text-white shadow transition hover:bg-[rgba(0,0,0,0.8)]">
							<span className="sr-only">{avatarActionLabel}</span>
							<Camera className="size-4" aria-hidden="true" />
							<input
								accept="image/*"
								aria-label={avatarInputAriaLabel}
								className="sr-only"
								onChange={handleAvatarChange}
								type="file"
							/>
						</label>
					) : null}
				</div>
				{showEditButton ? (
					<div className="absolute right-[-1px] top-[-1px] p-3">
						<button
							aria-label={editAriaLabel}
							className={[
								"flex size-[48px] items-center justify-center rounded-full text-[color:var(--text-invert,white)] transition",
								isEditing
									? "bg-[linear-gradient(180deg,#c2e812_0%,#ff7f11_50%,#ee4266_100%)]"
									: "bg-[var(--bg-transparent,rgba(255,255,255,0.12))]",
							]
								.join(" ")
								.trim()}
							onClick={onEditClick}
							type="button"
						>
							{resolvedEditIcon}
						</button>
					</div>
				) : null}
			</div>
		</div>
	);
}
