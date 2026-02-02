import { Card, type CardProps } from "@/components/card";

const IMG_ABS_PICTOGRAM =
	"https://www.figma.com/api/mcp/asset/85a0548c-271f-4fb1-a339-02d660e11fdc";
const IMG_ABS_OVERLAY =
	"https://www.figma.com/api/mcp/asset/6329b7ca-ae2d-4300-ab15-bb7166612e1a";
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
const IMG_KNOWLEDGE_PICTOGRAM =
	"https://www.figma.com/api/mcp/asset/1239ce0c-0fdb-4eac-868a-bfdfa095b992";

const EXERCISE_DESCRIPTION =
	"おへそを覗き込むように背中を丸め、息を吐ききりながら反動を使わずにゆっくりと腹筋を収縮させるのがポイントです。";

export const CARD_SAMPLE_DATA = {
	"abs-rare": {
		variant: "exercise",
		gradient: "rare",
		title: "腹筋30秒",
		description: EXERCISE_DESCRIPTION,
		backgroundSrc: IMG_ABS_BG_RARE,
		pictogramSrc: IMG_ABS_PICTOGRAM,
		pictogramOverlaySrc: IMG_ABS_OVERLAY,
		starIconSrc: IMG_STARS_RARE,
	},
	"abs-epic": {
		variant: "exercise",
		gradient: "epic",
		title: "腹筋45秒",
		description: EXERCISE_DESCRIPTION,
		backgroundSrc: IMG_ABS_BG_EPIC,
		pictogramSrc: IMG_ABS_PICTOGRAM,
		pictogramOverlaySrc: IMG_ABS_OVERLAY,
		starIconSrc: IMG_STARS_EPIC,
	},
	"abs-legend": {
		variant: "exercise",
		gradient: "legend",
		title: "腹筋60秒",
		description: EXERCISE_DESCRIPTION,
		backgroundSrc: IMG_ABS_BG_LEGEND,
		pictogramSrc: IMG_ABS_PICTOGRAM,
		pictogramOverlaySrc: IMG_ABS_OVERLAY,
		starIconSrc: IMG_STARS_LEGEND,
	},
	"knowledge-tip": {
		variant: "knowledge",
		gradient: "knowledge",
		headerLabel: "豆知識",
		title: "腕をぶっ壊す方法",
		description: EXERCISE_DESCRIPTION,
		backgroundSrc: IMG_KNOWLEDGE_BG,
		pictogramSrc: IMG_KNOWLEDGE_PICTOGRAM,
	},
} as const satisfies Record<string, CardProps>;

export type CardId = keyof typeof CARD_SAMPLE_DATA;

type CardRenderProps = {
	cardId: CardId;
	className?: string;
};

export function CardRender({ cardId, className }: CardRenderProps) {
	const card = CARD_SAMPLE_DATA[cardId];

	if (!card) {
		return null;
	}

	return <Card {...card} className={className} />;
}
