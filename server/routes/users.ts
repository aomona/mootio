import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { createHonoApp } from "@/server/create-app";
import { getUserOrThrow } from "@/server/middleware/auth";

const updateUserSchema = z.object({
	name: z.string().min(1).optional(),
	bio: z.string().optional(),
	imageUrl: z.string().url().optional().nullable(),
});

const usersRoute = createHonoApp()
	.get("/:userId", async (c) => {
		await getUserOrThrow(c);
		const userId = c.req.param("userId");

		const [user] = await db
			.select({
				id: users.id,
				name: users.name,
				iconUrl: users.imageUrl,
				bio: users.bio,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (!user) {
			throw new HTTPException(404, { message: "User not found" });
		}

		return c.json(user);
	})
	.patch("/:userId", zValidator("json", updateUserSchema), async (c) => {
		const { user } = await getUserOrThrow(c);
		const userId = c.req.param("userId");

		if (user.id !== userId) {
			throw new HTTPException(403, {
				message: "You can only update your own profile",
			});
		}

		const payload = c.req.valid("json");
		const messages: string[] = [];

		try {
			const updateData: Record<string, unknown> = {};
			if (payload.name !== undefined) updateData.name = payload.name;
			if (payload.bio !== undefined) updateData.bio = payload.bio;
			if (payload.imageUrl !== undefined)
				updateData.imageUrl = payload.imageUrl;

			if (Object.keys(updateData).length === 0) {
				return c.json({
					success: true,
					updated: false,
					messages: ["No fields to update"],
				});
			}

			await db.update(users).set(updateData).where(eq(users.id, userId));

			return c.json({
				success: true,
				updated: true,
			});
		} catch (error) {
			messages.push(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			return c.json(
				{
					success: false,
					updated: false,
					messages,
				},
				500,
			);
		}
	});

export default usersRoute;
