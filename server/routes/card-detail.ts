import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { cards } from "@/db/schema";
import { db } from "@/lib/db";
import { createHonoApp } from "@/server/create-app";
import { getUserOrThrow } from "@/server/middleware/auth";

const eventTypeMap: Record<string, string> = {
	H: "abs",
	U: "union",
	F: "festival",
};

const rarityMap: Record<string, string> = {
	"3": "rare",
	"4": "epic",
	"5": "legendary",
	knowledge: "knowledge",
};

const cardDetailRoute = createHonoApp().get("/:cardId", async (c) => {
	await getUserOrThrow(c);
	const cardId = c.req.param("cardId");

	const [card] = await db
		.select({
			id: cards.id,
			title: cards.title,
			content: cards.content,
			event: cards.event,
			rarity: cards.rarity,
		})
		.from(cards)
		.where(eq(cards.id, cardId))
		.limit(1);

	if (!card) {
		throw new HTTPException(404, { message: "Card not found" });
	}

	return c.json({
		id: card.id,
		title: card.title,
		content: card.content,
		event: card.event ? (eventTypeMap[card.event] ?? card.event) : null,
		rarity: card.rarity ? (rarityMap[card.rarity] ?? card.rarity) : null,
	});
});

export default cardDetailRoute;
