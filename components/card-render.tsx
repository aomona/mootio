"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { Card, type CardGradientName, type CardProps } from "@/components/card";
import { apiClient } from "@/lib/api-client";

const IMG_STARS_LEGEND = "/icons/card-stars-legend.svg";
const IMG_STARS_EPIC = "/icons/card-stars-epic.svg";
const IMG_STARS_RARE = "/icons/card-stars-rare.svg";
const STORAGE_BASE_URL = "https://storage.mootio.app/card";

const DEFAULT_BACKGROUND_BY_GRADIENT: Record<CardGradientName, string> = {
	rare: "/signup/bg-pattern.svg",
	epic: "/signup/bg-pattern.svg",
	legend: "/signup/bg-pattern.svg",
	knowledge: "/signup/bg-pattern.svg",
};

const DEFAULT_STAR_ICON_BY_GRADIENT: Record<
	Exclude<CardGradientName, "knowledge">,
	string
> = {
	rare: IMG_STARS_RARE,
	epic: IMG_STARS_EPIC,
	legend: IMG_STARS_LEGEND,
};

type CardDetailResponse = {
	id: string;
	title: string;
	content: string | null;
	event: string | null;
	rarity: string | null;
};

type CardDetailData = CardDetailResponse & {
	gradient: CardGradientName;
};

type CardRenderProps = {
	cardId: string;
	className?: string;
	fallback?: ReactNode;
	backgroundSrc?: string;
	starIconSrc?: string;
};

const resolveGradient = (rarity: string | null): CardGradientName | null => {
	if (!rarity) {
		return null;
	}
	if (rarity === "legendary") {
		return "legend";
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

export function CardRender({
	cardId,
	className,
	fallback,
	backgroundSrc,
	starIconSrc,
}: CardRenderProps) {
	const [cardData, setCardData] = useState<CardDetailData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (!cardId) {
			setCardData(null);
			setIsLoading(false);
			setHasError(false);
			return;
		}

		let ignore = false;

		const load = async () => {
			setIsLoading(true);
			setHasError(false);
			setCardData(null);

			try {
				const response = await apiClient.api.cards[":cardId"].$get({
					param: { cardId },
				});
				if (!response.ok) {
					if (!ignore) {
						setHasError(true);
					}
					return;
				}
				const body = (await response
					.json()
					.catch(() => null)) as CardDetailResponse | null;
				if (!body || !body.event) {
					if (!ignore) {
						setHasError(true);
					}
					return;
				}
				const gradient = resolveGradient(body.rarity);
				if (!gradient) {
					if (!ignore) {
						setHasError(true);
					}
					return;
				}
				if (!ignore) {
					setCardData({ ...body, gradient });
				}
			} catch {
				if (!ignore) {
					setHasError(true);
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
	}, [cardId]);

	const cardProps = useMemo<CardProps | null>(() => {
		if (!cardData) {
			return null;
		}
		const { gradient, event, title, content } = cardData;
		const isKnowledge = gradient === "knowledge";
		const resolvedBackgroundSrc =
			backgroundSrc ?? DEFAULT_BACKGROUND_BY_GRADIENT[gradient];
		const pictogramSrc = `${STORAGE_BASE_URL}/${event}/pictogram.svg?v=1`;
		const pictogramOverlaySrc = `${STORAGE_BASE_URL}/${event}/pictogram-overlay.svg?v=1`;

		if (isKnowledge) {
			return {
				variant: "knowledge",
				gradient,
				headerLabel: "豆知識",
				title,
				description: content ?? "",
				backgroundSrc: resolvedBackgroundSrc,
				pictogramSrc,
			};
		}

		const resolvedStarIconSrc =
			starIconSrc ??
			DEFAULT_STAR_ICON_BY_GRADIENT[gradient as "rare" | "epic" | "legend"];
		return {
			variant: "exercise",
			gradient,
			title,
			description: content ?? "",
			backgroundSrc: resolvedBackgroundSrc,
			pictogramSrc,
			pictogramOverlaySrc,
			starIconSrc: resolvedStarIconSrc,
		};
	}, [backgroundSrc, cardData, starIconSrc]);

	if (!cardId) {
		return fallback ?? null;
	}

	if (hasError) {
		return fallback ?? null;
	}

	if (isLoading || !cardProps) {
		return null;
	}

	return <Card {...cardProps} className={className} />;
}
