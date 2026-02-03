import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { cards, cardUsers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { createHonoApp } from "@/server/create-app";
import { getUserOrThrow } from "@/server/middleware/auth";

// イベントタイプのマッピング
const eventTypeMap: Record<string, string> = {
	H: "abs",
	U: "union",
	F: "festival",
};

// レアリティのマッピング
const rarityMap: Record<string, string> = {
	"3": "rare",
	"4": "epic",
	"5": "legendary",
	knowledge: "knowledge",
};

const cardsRoute = createHonoApp().get("/:userId/cards", async (c) => {
	await getUserOrThrow(c);
	const userId = c.req.param("userId");

	// ユーザーが存在するか確認
	const [targetUser] = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.id, userId))
		.limit(1);

	if (!targetUser) {
		throw new HTTPException(404, { message: "User not found" });
	}

	// ユーザーが取得したカード一覧を取得
	const userCards = await db
		.select({
			id: cards.id,
			event: cards.event,
			rarity: cards.rarity,
			created_at: cards.id, // カードにcreated_atがない場合、cardUsersテーブルから取得する必要があるかも
		})
		.from(cardUsers)
		.innerJoin(cards, eq(cardUsers.cardId, cards.id))
		.where(eq(cardUsers.userId, userId));

	// イベントとレアリティを変換
	const transformedCards = userCards.map((card) => ({
		id: card.id,
		event: card.event ? eventTypeMap[card.event] || card.event : null,
		rarity: card.rarity ? rarityMap[card.rarity] || card.rarity : null,
		created_at: card.created_at, // 適切なタイムスタンプに変更が必要かも
	}));

	return c.json(transformedCards);
});

export default cardsRoute;
