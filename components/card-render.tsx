"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";

import { Card, type CardGradientName, type CardProps } from "@/components/card";
import { apiClient } from "@/lib/api-client";

const IMG_ABS_BG_RARE =
	"https://www.figma.com/api/mcp/asset/e1d44955-a39f-4d72-85bc-b3cfb858272b";
const IMG_ABS_BG_EPIC =
	"https://www.figma.com/api/mcp/asset/f94a43f4-060f-4ca2-97cb-dc45e9c9b84e";
const IMG_ABS_BG_LEGEND =
	"https://www.figma.com/api/mcp/asset/87a35337-3eb8-4eef-9c2a-ed20470b0acc";
const IMG_STARS_LEGEND =
	"https://www.figma.com/api/mcp/asset/10c8214d-f88a-462a-9094-ede5662364fb";
const IMG_STARS_EPIC =
	"https://www.figma.com/api/mcp/asset/ef9a7938-40cf-4051-87f2-0eb3f0af2c67";
const IMG_STARS_RARE =
	"https://www.figma.com/api/mcp/asset/acdd5554-8672-498a-8902-2244fc2c8d20";
const IMG_KNOWLEDGE_BG =
	"https://www.figma.com/api/mcp/asset/c0642eae-191b-46dd-bc7a-ae733416447d";
const STORAGE_BASE_URL = "https://storage.mootio.app/card";

const DEFAULT_BACKGROUND_BY_GRADIENT: Record<CardGradientName, string> = {
	rare: IMG_ABS_BG_RARE,
	epic: IMG_ABS_BG_EPIC,
	legend: IMG_ABS_BG_LEGEND,
	knowledge: IMG_KNOWLEDGE_BG,
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
		const pictogramSrc = `${STORAGE_BASE_URL}/${event}/pictogram.svg?b`;
		const pictogramOverlaySrc = `${STORAGE_BASE_URL}/${event}/pictogram-overlay.svg?b`;

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
