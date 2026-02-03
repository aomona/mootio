"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ProfileCard } from "@/components/profile-card";
import { apiClient } from "@/lib/api-client";
import { authClient } from "@/lib/auth-client";

const FALLBACK_AVATAR = "/icon512_rounded.png";

type ProfileResponse = {
	id: string;
	name: string | null;
	bio: string | null;
	image: string | null;
};

type FollowCountResponse = {
	followCount: number;
	followerCount: number;
};

type FollowStatusResponse = {
	isFollowing: boolean;
};

type UpdateResponse = {
	success: boolean;
	updated: boolean;
	messages?: string[];
};

const getErrorMessage = (body: unknown) => {
	if (body && typeof body === "object" && "error" in body) {
		const errorValue = (body as { error?: unknown }).error;
		if (typeof errorValue === "string") {
			return errorValue;
		}
	}
	return null;
};

const getFirstMessage = (body: unknown) => {
	if (body && typeof body === "object" && "messages" in body) {
		const messagesValue = (body as { messages?: unknown }).messages;
		if (Array.isArray(messagesValue)) {
			const first = messagesValue[0];
			if (typeof first === "string") {
				return first;
			}
		}
	}
	return null;
};

const isUpdateResponse = (body: unknown): body is UpdateResponse => {
	return (
		!!body && typeof body === "object" && "success" in body && "updated" in body
	);
};

const ProfileCardSkeleton = () => (
	<div className="relative mx-auto flex w-[345px] flex-col items-start animate-pulse">
		<div className="h-12 w-full" aria-hidden="true" />
		<div className="relative w-full rounded-[36px] border border-[rgba(255,255,255,0.24)] bg-[var(--bg-invert,#1e1e1e)] px-6 pb-6 pt-[64px] shadow-[0px_12px_24px_0px_rgba(0,0,0,0.12)]">
			<div className="flex flex-col gap-3">
				<div className="h-5 w-32 rounded-full bg-white/20" />
				<div className="h-4 w-56 rounded-full bg-white/10" />
			</div>
			<div className="mt-4 flex w-full items-center gap-2.5">
				<div className="flex-1 rounded-[12px] bg-white/10 py-6" />
				<div className="flex-1 rounded-[12px] bg-white/10 py-6" />
			</div>
			<div className="mt-4 h-[56px] w-full rounded-[12px] bg-white/10" />
			<div className="absolute left-[23px] top-[-49px] h-[96px] w-[96px] rounded-full border-4 border-[var(--bg-invert,#1e1e1e)] bg-white/10" />
			<div className="absolute right-[-1px] top-[-1px] size-[48px] rounded-full bg-white/10" />
		</div>
	</div>
);

export default function HomePage() {
	const params = useParams();
	const { data: session, isPending } = authClient.useSession();
	const userId = useMemo(() => {
		const value = params?.id;
		if (typeof value === "string") {
			return value;
		}
		if (Array.isArray(value)) {
			return value[0] ?? "";
		}
		return "";
	}, [params]);
	const sessionUserId = session?.user?.id ?? "";
	const isSelf = !!userId && sessionUserId === userId;

	const [profile, setProfile] = useState<ProfileResponse | null>(null);
	const [counts, setCounts] = useState<FollowCountResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isFollowLoading, setIsFollowLoading] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [draftName, setDraftName] = useState("");
	const [draftBio, setDraftBio] = useState("");
	const [draftAvatarFile, setDraftAvatarFile] = useState<File | null>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const fetchProfile = useCallback(async () => {
		if (!userId) {
			throw new Error("ユーザーIDが見つかりません");
		}

		const profileResponse = await apiClient.api.users[":userId"].$get({
			param: { userId },
		});
		const profileBody = (await profileResponse.json().catch(() => null)) as
			| unknown
			| null;
		if (!profileResponse.ok) {
			throw new Error(
				getErrorMessage(profileBody) ?? "プロフィールの取得に失敗しました",
			);
		}
		if (!profileBody) {
			throw new Error("プロフィールの取得に失敗しました");
		}
		const profileData = profileBody as ProfileResponse;

		const countResponse = await apiClient.api.users[":userId"].count.$get({
			param: { userId },
		});
		const countBody = (await countResponse.json().catch(() => null)) as
			| unknown
			| null;
		const countData =
			countResponse.ok && countBody ? (countBody as FollowCountResponse) : null;

		return { profileData, countData };
	}, [userId]);

	useEffect(() => {
		if (!userId) {
			setError("ユーザーIDが見つかりません");
			setIsLoading(false);
			return;
		}

		let ignore = false;

		const load = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const { profileData, countData } = await fetchProfile();
				if (ignore) return;
				setProfile(profileData);
				setCounts(countData);
			} catch (loadError) {
				if (ignore) return;
				setError(
					loadError instanceof Error
						? loadError.message
						: "プロフィールの取得に失敗しました",
				);
				setProfile(null);
				setCounts(null);
			} finally {
				if (!ignore) {
					setIsLoading(false);
				}
			}
		};

		void load();

		return () => {
			ignore = true;
		};
	}, [fetchProfile, userId]);

	useEffect(() => {
		if (!userId || !sessionUserId || sessionUserId === userId) {
			setIsFollowing(false);
			setIsFollowLoading(false);
			return;
		}

		let ignore = false;

		const load = async () => {
			setIsFollowLoading(true);
			try {
				const response = await apiClient.api.users[":userId"].status.$get({
					param: { userId },
				});
				if (ignore) return;
				if (!response.ok) {
					setIsFollowing(false);
					return;
				}
				const body = (await response.json()) as FollowStatusResponse;
				setIsFollowing(body.isFollowing);
			} catch {
				if (!ignore) {
					setIsFollowing(false);
				}
			} finally {
				if (!ignore) {
					setIsFollowLoading(false);
				}
			}
		};

		void load();

		return () => {
			ignore = true;
		};
	}, [sessionUserId, userId]);

	useEffect(() => {
		if (!profile || isEditing) {
			return;
		}
		setDraftName(profile.name ?? "");
		setDraftBio(profile.bio ?? "");
	}, [isEditing, profile]);

	useEffect(() => {
		if (!userId) {
			return;
		}
		setActionError(null);
	}, [userId]);

	useEffect(() => {
		if (isSelf) {
			return;
		}
		setIsEditing(false);
		setDraftAvatarFile(null);
		setSaveError(null);
	}, [isSelf]);

	useEffect(() => {
		if (!draftAvatarFile) {
			setAvatarPreview(null);
			return;
		}
		const url = URL.createObjectURL(draftAvatarFile);
		setAvatarPreview(url);
		return () => {
			URL.revokeObjectURL(url);
		};
	}, [draftAvatarFile]);

	const resetDrafts = useCallback(() => {
		setDraftName(profile?.name ?? "");
		setDraftBio(profile?.bio ?? "");
		setDraftAvatarFile(null);
	}, [profile]);

	const handleSave = useCallback(async () => {
		if (!profile || !userId || isSaving) {
			return false;
		}
		setSaveError(null);
		const hasPayload =
			draftName !== (profile.name ?? "") ||
			draftBio !== (profile.bio ?? "") ||
			!!draftAvatarFile;
		if (!hasPayload) {
			setIsEditing(false);
			setDraftAvatarFile(null);
			return true;
		}
		setIsSaving(true);
		try {
			const formData = new FormData();
			if (draftName !== (profile.name ?? "")) {
				formData.append("name", draftName);
			}
			if (draftBio !== (profile.bio ?? "")) {
				formData.append("bio", draftBio);
			}
			if (draftAvatarFile) {
				formData.append("image", draftAvatarFile);
			}

			const response = await apiClient.api.users[":userId"].$patch(
				{ param: { userId } },
				{ init: { body: formData } },
			);
			const body = (await response.json().catch(() => null)) as unknown;
			if (!response.ok) {
				throw new Error(
					getFirstMessage(body) ??
						getErrorMessage(body) ??
						"更新に失敗しました",
				);
			}
			if (!isUpdateResponse(body) || !body.success) {
				throw new Error(getFirstMessage(body) ?? "更新に失敗しました");
			}

			const { profileData, countData } = await fetchProfile();
			setProfile(profileData);
			setCounts(countData);
			setIsEditing(false);
			setDraftAvatarFile(null);
			return true;
		} catch (updateError) {
			setSaveError(
				updateError instanceof Error
					? updateError.message
					: "更新に失敗しました",
			);
			return false;
		} finally {
			setIsSaving(false);
		}
	}, [
		draftAvatarFile,
		draftBio,
		draftName,
		fetchProfile,
		isSaving,
		profile,
		userId,
	]);

	const handleEditToggle = useCallback(async () => {
		if (!isSelf || isSaving) {
			return;
		}
		setSaveError(null);
		if (!isEditing) {
			resetDrafts();
			setIsEditing(true);
			return;
		}
		await handleSave();
	}, [handleSave, isEditing, isSaving, isSelf, resetDrafts]);

	const handleFollowToggle = useCallback(async () => {
		if (!userId || !sessionUserId || isSelf || isFollowLoading) {
			return;
		}
		setIsFollowLoading(true);
		setActionError(null);
		try {
			const response = isFollowing
				? await apiClient.api.users[":userId"].follow.$delete({
						param: { userId },
					})
				: await apiClient.api.users[":userId"].follow.$post({
						param: { userId },
					});
			if (!response.ok) {
				const body = (await response.json().catch(() => null)) as {
					error?: string;
					messages?: string[];
				} | null;
				throw new Error(
					body?.messages?.[0] ?? body?.error ?? "操作に失敗しました",
				);
			}
			setIsFollowing((current) => !current);
			setCounts((current) => {
				if (!current) {
					return current;
				}
				const delta = isFollowing ? -1 : 1;
				return {
					...current,
					followerCount: Math.max(0, current.followerCount + delta),
				};
			});
		} catch (followError) {
			setActionError(
				followError instanceof Error
					? followError.message
					: "操作に失敗しました",
			);
		} finally {
			setIsFollowLoading(false);
		}
	}, [isFollowLoading, isFollowing, isSelf, sessionUserId, userId]);

	const displayName = profile?.name ?? "ユーザー";
	const displayBio = profile?.bio ?? "プロフィールはまだありません";
	const avatarSrc = avatarPreview ?? profile?.image ?? FALLBACK_AVATAR;
	const namePlaceholder = profile?.name ?? "名前を入力";
	const bioPlaceholder = profile?.bio ?? "自己紹介を書いてみよう";
	const cardVariant = isSelf
		? isEditing
			? "editing"
			: "mine"
		: isFollowing
			? "following"
			: "has-follow";
	const title = isPending
		? "プロフィール"
		: isSelf
			? "自分のプロフィール"
			: `${displayName}さんのプロフィール`;

	return (
		<div className="relative w-screen pb-24">
			<div className="flex flex-col items-center pt-10 pb-5 text-black">
				<h2 className="text-lg font-bold">{title}</h2>
			</div>
			{error ? (
				<p className="mx-auto mb-4 w-[345px] text-center text-sm text-red-600">
					{error}
				</p>
			) : null}
			{isLoading ? (
				<ProfileCardSkeleton />
			) : profile ? (
				<ProfileCard
					avatarAlt={displayName}
					avatarSrc={avatarSrc}
					bio={displayBio}
					bioPlaceholder={bioPlaceholder}
					className="mx-auto"
					editAriaLabel={
						isEditing ? "プロフィールを保存" : "プロフィールを編集"
					}
					followersCount={counts?.followerCount ?? 0}
					followingCount={counts?.followCount ?? 0}
					isFollowDisabled={isFollowLoading || !sessionUserId}
					isAvatarEditable={isSelf && isEditing}
					name={displayName}
					namePlaceholder={namePlaceholder}
					nameValue={isEditing ? draftName : undefined}
					bioValue={isEditing ? draftBio : undefined}
					onAvatarChange={(file) => setDraftAvatarFile(file)}
					onBioChange={isEditing ? setDraftBio : undefined}
					onEditClick={() => {
						void handleEditToggle();
					}}
					onFollowClick={handleFollowToggle}
					onNameChange={isEditing ? setDraftName : undefined}
					variant={cardVariant}
				/>
			) : (
				<p className="mx-auto w-[345px] text-center text-sm text-black/70">
					プロフィールを読み込めませんでした
				</p>
			)}
			{actionError ? (
				<p className="mx-auto mt-3 w-[345px] text-center text-xs text-red-600">
					{actionError}
				</p>
			) : null}
			{saveError ? (
				<p className="mx-auto mt-2 w-[345px] text-center text-xs text-red-400">
					{saveError}
				</p>
			) : null}
			{isSaving ? (
				<p className="mx-auto mt-2 w-[345px] text-center text-xs text-black/60">
					保存中...
				</p>
			) : null}
		</div>
	);
}
