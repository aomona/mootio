import { and, eq } from "drizzle-orm";
import { chains, followers, users } from "@/db/schema";
import { db } from "@/lib/db";
import { createSendPushNotificationToUser } from "@/server/applications/usecases/send-push-notification";
import { createHonoApp } from "@/server/create-app";
import { createPushNotificationRepository } from "@/server/infrastructure/repositories/push-notification";
import { createPushSubscriptionRepository } from "@/server/infrastructure/repositories/push-subscription";
import { getUserOrThrow } from "@/server/middleware/auth";

const chainsRoute = createHonoApp()
	.get("/users", async (c) => {
		await getUserOrThrow(c);

		// チェーンに参加しているユーザーを取得
		const chainUsers = await db
			.select({
				id: users.id,
				name: users.name,
				iconUrl: users.imageUrl,
			})
			.from(chains)
			.innerJoin(users, eq(chains.userId, users.id));

		return c.json({ users: chainUsers });
	})
	.post("/join", async (c) => {
		const { user } = await getUserOrThrow(c);
		const messages: string[] = [];

		try {
			// 既にチェーンに参加しているか確認
			const [existingChain] = await db
				.select()
				.from(chains)
				.where(eq(chains.userId, user.id))
				.limit(1);

			if (existingChain) {
				return c.json({
					success: true,
					joined: true,
					messages: ["Already joined the chain"],
				});
			}

			// チェーンに参加
			const chainId = `${user.id}_${Date.now()}`;
			await db.insert(chains).values({
				id: chainId,
				userId: user.id,
				joinCount: 1,
			});

			// フォロワーに通知を送信
			try {
				const userFollowers = await db
					.select({ userId: followers.followerId })
					.from(followers)
					.where(eq(followers.followeeId, user.id));

				const subscriptionRepo = createPushSubscriptionRepository(c.get("db"));
				const notificationRepo = createPushNotificationRepository();
				const sendNotification = createSendPushNotificationToUser(
					subscriptionRepo.findSubscriptionsByUserId,
					notificationRepo.sendPushNotification,
					subscriptionRepo.deleteSubscriptionById,
				);

				// 各フォロワーに通知
				await Promise.allSettled(
					userFollowers.map((follower) =>
						sendNotification(follower.userId, {
							title: "New Chain Activity",
							body: `${user.name} joined the chain!`,
							url: "/",
						}),
					),
				);
			} catch (notificationError) {
				// 通知の失敗はログに記録するだけで、全体の処理は続行
				console.error("Failed to send notifications:", notificationError);
			}

			return c.json({
				success: true,
				joined: true,
			});
		} catch (error) {
			messages.push(
				error instanceof Error ? error.message : "Unknown error occurred",
			);
			return c.json(
				{
					success: false,
					joined: false,
					messages,
				},
				500,
			);
		}
	})
	.get("/joined", async (c) => {
		const { user } = await getUserOrThrow(c);

		// ユーザーがチェーンに参加しているか確認
		const [userChain] = await db
			.select()
			.from(chains)
			.where(eq(chains.userId, user.id))
			.limit(1);

		if (!userChain) {
			return c.json({
				joined: false,
			});
		}

		// チェーンに参加している全ユーザーを取得（フォロー中を優先）
		const chainUsersWithFollowStatus = await db
			.select({
				userId: users.id,
				userName: users.name,
				userIcon: users.imageUrl,
				isFollowing: followers.followerId,
			})
			.from(chains)
			.innerJoin(users, eq(chains.userId, users.id))
			.leftJoin(
				followers,
				and(
					eq(followers.followerId, user.id),
					eq(followers.followeeId, users.id),
				),
			)
			.where(eq(chains.userId, chains.userId));

		// フォロー中のユーザーを最初に、それ以外をランダムにソート
		const followingUsers = chainUsersWithFollowStatus.filter(
			(u) => u.isFollowing !== null && u.userId !== user.id,
		);
		const otherUsers = chainUsersWithFollowStatus.filter(
			(u) => u.isFollowing === null && u.userId !== user.id,
		);

		// ランダムにシャッフル
		const shuffleArray = <T>(array: T[]): T[] => {
			const shuffled = [...array];
			for (let i = shuffled.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
			}
			return shuffled;
		};

		const shuffledFollowing = shuffleArray(followingUsers);
		const shuffledOthers = shuffleArray(otherUsers);
		const sortedUsers = [...shuffledFollowing, ...shuffledOthers];

		const topUser = sortedUsers[0];
		const iconUsers = sortedUsers.slice(0, 2);

		return c.json({
			joined: true,
			label: {
				count: chainUsersWithFollowStatus.length,
				top_user_name: topUser?.userName ?? "",
				top_user_icon: topUser?.userIcon ?? "",
				icons: iconUsers.map((u) => u.userIcon ?? ""),
			},
		});
	});

export default chainsRoute;
