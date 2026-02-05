"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CardPreview } from "@/components/card-preview";
import { CollectionCardOverlay } from "@/components/collection/collection-card-overlay";
import { TrophyCard } from "@/components/trophy-card";
import { apiClient } from "@/lib/api-client";

const STORAGE_BASE_URL = "https://storage.mootio.app/card";
const ICON_TROPHY_SRC = "/icons/icon-trophy.svg";
const ICON_CARD_SRC = "/icons/icon-card-white.svg";

type CardPreviewGradient =
	| "rare"
	| "epic"
	| "legend"
	| "legendary"
	| "knowledge";

type UserCard = {
	id: string;
	event: string | null;
	rarity: string | null;
	created_at: string | null;
};

type UserTrophy = {
	id: string;
	title: string;
	thumbnail_url: string | null;
	created_at: string | null;
};

type CollectionScreenProps = {
	userId: string;
	className?: string;
	is_page?: boolean;
};

const resolveGradient = (rarity: string | null): CardPreviewGradient | null => {
	if (!rarity) {
		return null;
	}
	if (rarity === "legendary") {
		return "legendary";
	}
	if (
		rarity === "rare" ||
		rarity === "epic" ||
		rarity === "legend" ||
		rarity === "knowledge"
	) {
		return rarity;
	}
	return null;
};

const getErrorMessage = (body: unknown) => {
	if (body && typeof body === "object" && "error" in body) {
		const errorValue = (body as { error?: unknown }).error;
		if (typeof errorValue === "string") {
			return errorValue;
		}
	}
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

const SectionLabel = ({
	iconSrc,
	label,
}: {
	iconSrc: string;
	label: string;
}) => (
	<div className="flex items-center gap-[12px] rounded-[333px] bg-[#1e1e1e] px-[24px] py-[12px] text-white w-[fit-content] mb-3">
		<img alt="" className="size-[24px]" src={iconSrc} />
		<p className="text-[16px] leading-[normal] text-white font-bold">{label}</p>
	</div>
);

export function CollectionScreen({
	userId,
	is_page,
	className,
}: CollectionScreenProps) {
	const [cards, setCards] = useState<UserCard[]>([]);
	const [trophies, setTrophies] = useState<UserTrophy[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
	const [cardOverlayOpen, setCardOverlayOpen] = useState(false);
	const [cardOverlayAnimate, setCardOverlayAnimate] = useState(false);

	const handleCardClick = useCallback((cardId: string) => {
		setSelectedCardId(cardId);
		setCardOverlayAnimate(true);
		setCardOverlayOpen(true);
	}, []);

	const handleCardOverlayClose = useCallback(() => {
		setCardOverlayAnimate(true);
		setCardOverlayOpen(false);
	}, []);

	useEffect(() => {
		if (!userId) {
			setError("ユーザーIDが必要です");
			setIsLoading(false);
			return;
		}

		let ignore = false;

		const load = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const [cardsResponse, trophiesResponse] = await Promise.all([
					apiClient.api.users[":userId"].cards.$get({ param: { userId } }),
					apiClient.api.users[":userId"].trophies.$get({ param: { userId } }),
				]);

				const cardsBody = (await cardsResponse
					.json()
					.catch(() => null)) as unknown;
				if (!cardsResponse.ok) {
					throw new Error(
						getErrorMessage(cardsBody) ?? "カードの取得に失敗しました",
					);
				}
				const trophiesBody = (await trophiesResponse
					.json()
					.catch(() => null)) as unknown;
				if (!trophiesResponse.ok) {
					throw new Error(
						getErrorMessage(trophiesBody) ?? "トロフィーの取得に失敗しました",
					);
				}

				if (!ignore) {
					setCards(Array.isArray(cardsBody) ? (cardsBody as UserCard[]) : []);
					setTrophies(
						Array.isArray(trophiesBody) ? (trophiesBody as UserTrophy[]) : [],
					);
				}
			} catch (loadError) {
				if (!ignore) {
					setError(
						loadError instanceof Error
							? loadError.message
							: "読み込みに失敗しました",
					);
				}
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
	}, [userId]);

	const cardCountById = useMemo(() => {
		const map = new Map<string, number>();
		for (const card of cards) {
			map.set(card.id, (map.get(card.id) ?? 0) + 1);
		}
		return map;
	}, [cards]);

	const uniqueCards = useMemo(() => {
		const map = new Map<string, UserCard>();
		for (const card of cards) {
			if (!map.has(card.id)) {
				map.set(card.id, card);
			}
		}
		return Array.from(map.values());
	}, [cards]);

	const cardItems = useMemo(() => {
		return uniqueCards.flatMap((card) => {
			const gradient = resolveGradient(card.rarity);
			if (!gradient) {
				return [];
			}
			const event = card.event;
			const pictogramSrc = `${STORAGE_BASE_URL}/${event}/pictogram.svg?b`;
			const unionSrc = `${STORAGE_BASE_URL}/${event}/pictogram-overlay.svg?b`;
			return [
				<button
					key={card.id}
					type="button"
					aria-label="カードの獲得枚数を表示"
					onClick={() => handleCardClick(card.id)}
					className="shrink-0 rounded-[36px] border-0 bg-transparent p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 my-2.5"
				>
					<CardPreview
						className="shrink-0"
						gradient={gradient}
						pictogramSrc={pictogramSrc}
						unionSrc={unionSrc}
					/>
				</button>,
			];
		});
	}, [handleCardClick, uniqueCards]);

	const rootClassName = ["relative pb-28", className ?? ""].join(" ").trim();

	if (isLoading) {
		return (
			<div className="mx-auto w-[345px] pt-20 text-center text-sm text-black/70">
				読み込み中...
			</div>
		);
	}

	if (error) {
		return (
			<div className="mx-auto w-[345px] pt-20 text-center text-sm text-red-600">
				{error}
			</div>
		);
	}

	return (
		<>
			<div className={rootClassName}>
				{is_page ? null : (
					<div className="flex flex-col items-center pb-4 pt-10 text-black">
						<h2 className="text-lg font-bold">コレクション</h2>
					</div>
				)}
				<div className="flex flex-col gap-[24px] px-[24px] pb-24">
					<div className="flex flex-col gap-[12px]">
						<SectionLabel iconSrc={ICON_TROPHY_SRC} label="トロフィー" />
						{trophies.length === 0 ? (
							<p className="text-sm text-black/70">
								トロフィーはまだありません
							</p>
						) : (
							<div className="flex gap-[12px] overflow-x-auto pb-2">
								{trophies.map((trophy) => (
									<TrophyCard
										key={trophy.id}
										awardedAt={trophy.created_at}
										thumbnailSrc={trophy.thumbnail_url}
										title={trophy.title}
									/>
								))}
							</div>
						)}
					</div>
					<div className="flex flex-col gap-[12px]">
						<SectionLabel iconSrc={ICON_CARD_SRC} label="カード" />
						{cardItems.length === 0 ? (
							<p className="text-sm text-black/70">カードはまだありません</p>
						) : (
							<div className="grid grid-cols-2 gap-[12px] justify-items-center">
								{cardItems}
							</div>
						)}
					</div>
				</div>
			</div>
			<CollectionCardOverlay
				open={cardOverlayOpen}
				animate={cardOverlayAnimate}
				cardId={selectedCardId}
				count={selectedCardId ? (cardCountById.get(selectedCardId) ?? 1) : 1}
				onClose={handleCardOverlayClose}
			/>
		</>
	);
}
