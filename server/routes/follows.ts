import { and, count, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { followers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { createSendPushNotificationToUser } from "@/server/applications/usecases/send-push-notification";
import { createHonoApp } from "@/server/create-app";
import { createPushNotificationRepository } from "@/server/infrastructure/repositories/push-notification";
import { createPushSubscriptionRepository } from "@/server/infrastructure/repositories/push-subscription";
import { getUserOrThrow } from "@/server/middleware/auth";

const followsRoute = createHonoApp()
	.post("/:userId/follow", async (c) => {
		const { user } = await getUserOrThrow(c);
		const userId = c.req.param("userId");
		const messages: string[] = [];

		if (user.id === userId) {
			throw new HTTPException(400, {
				message: "You cannot follow yourself",
			});
		}

		try {
			// ユーザーが存在するか確認
			const [targetUser] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (!targetUser) {
				throw new HTTPException(404, { message: "User not found" });
			}

			// 既にフォローしているか確認
			const [existingFollow] = await db
				.select()
				.from(followers)
				.where(
					and(
						eq(followers.followerId, user.id),
						eq(followers.followeeId, userId),
					),
				)
				.limit(1);

			if (existingFollow) {
				return c.json({
					success: true,
					followed: false,
					messages: ["Already following this user"],
				});
			}

			// フォロー関係を作成
			await db.insert(followers).values({
				followerId: user.id,
				followeeId: userId,
			});

			try {
				const subscriptionRepo = createPushSubscriptionRepository(c.get("db"));
				const notificationRepo = createPushNotificationRepository();
				const sendNotification = createSendPushNotificationToUser(
					subscriptionRepo.findSubscriptionsByUserId,
					notificationRepo.sendPushNotification,
					subscriptionRepo.deleteSubscriptionById,
				);
				const baseUrl = process.env.BETTER_AUTH_URL;
				if (!baseUrl) {
					throw new Error("BETTER_AUTH_URL is missing");
				}
				const profileUrl = new URL(
					`/app/profile/${user.id}`,
					baseUrl,
				).toString();
				await sendNotification(userId, {
					title: "フォロー通知",
					body: `${user.name}さんにフォローされました！！`,
					url: profileUrl,
				});
			} catch (notificationError) {
				console.error("Failed to send follow notification:", notificationError);
			}

			return c.json({
				success: true,
				followed: true,
			});
		} catch (error) {
			if (error instanceof HTTPException) {
				throw error;
			}

			messages.push(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			return c.json(
				{
					success: false,
					followed: false,
					messages,
				},
				500,
			);
		}
	})
	.delete("/:userId/follow", async (c) => {
		const { user } = await getUserOrThrow(c);
		const userId = c.req.param("userId");
		const messages: string[] = [];

		if (user.id === userId) {
			throw new HTTPException(400, {
				message: "You cannot unfollow yourself",
			});
		}

		try {
			// ユーザーが存在するか確認
			const [targetUser] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.id, userId))
				.limit(1);

			if (!targetUser) {
				throw new HTTPException(404, { message: "User not found" });
			}

			// フォロー関係が存在するか確認
			const [existingFollow] = await db
				.select()
				.from(followers)
				.where(
					and(
						eq(followers.followerId, user.id),
						eq(followers.followeeId, userId),
					),
				)
				.limit(1);

			if (!existingFollow) {
				return c.json({
					success: true,
					unfollowed: false,
					messages: ["You are not following this user"],
				});
			}

			// フォロー関係を削除
			await db
				.delete(followers)
				.where(
					and(
						eq(followers.followerId, user.id),
						eq(followers.followeeId, userId),
					),
				);

			return c.json({
				success: true,
				unfollowed: true,
			});
		} catch (error) {
			if (error instanceof HTTPException) {
				throw error;
			}

			messages.push(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			return c.json(
				{
					success: false,
					unfollowed: false,
					messages,
				},
				500,
			);
		}
	})
	.get("/:userId/status", async (c) => {
		const { user } = await getUserOrThrow(c);
		const userId = c.req.param("userId");

		// フォロー関係を確認
		const [followRelation] = await db
			.select()
			.from(followers)
			.where(
				and(
					eq(followers.followerId, user.id),
					eq(followers.followeeId, userId),
				),
			)
			.limit(1);

		return c.json({
			isFollowing: !!followRelation,
		});
	})
	.get("/:userId/count", async (c) => {
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

		// フォロー数（このユーザーがフォローしている人数）
		const [followingResult] = await db
			.select({ count: count() })
			.from(followers)
			.where(eq(followers.followerId, userId));

		// フォロワー数（このユーザーをフォローしている人数）
		const [followerResult] = await db
			.select({ count: count() })
			.from(followers)
			.where(eq(followers.followeeId, userId));

		return c.json({
			followCount: followingResult?.count ?? 0,
			followerCount: followerResult?.count ?? 0,
		});
	});

export default followsRoute;
