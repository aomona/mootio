import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { trophies, users, userTrophies } from "@/db/schema";
import { db } from "@/lib/db";
import { createHonoApp } from "@/server/create-app";
import { getUserOrThrow } from "@/server/middleware/auth";

const trophiesRoute = createHonoApp().get("/:userId/trophies", async (c) => {
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

	// ユーザーが取得したトロフィー一覧を取得
	const userTrophiesList = await db
		.select({
			id: trophies.id,
			title: trophies.title,
			model_url: trophies.modelUrl,
			thumbnail_url: trophies.thumbnailUrl,
			created_at: trophies.id, // トロフィーテーブルにcreated_atがないため暫定的にIDを使用
		})
		.from(userTrophies)
		.innerJoin(trophies, eq(userTrophies.trophyId, trophies.id))
		.where(eq(userTrophies.userId, userId));

	return c.json(userTrophiesList);
});

export default trophiesRoute;
