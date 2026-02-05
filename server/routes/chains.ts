import { and, eq, gte, lt, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import {
	cards,
	cardUsers,
	chains,
	followers,
	users,
	userTrophies,
} from "@/db/schema";
import { db } from "@/lib/db";
import { createSendPushNotificationToUser } from "@/server/applications/usecases/send-push-notification";
import { createHonoApp } from "@/server/create-app";
import { createPushNotificationRepository } from "@/server/infrastructure/repositories/push-notification";
import { createPushSubscriptionRepository } from "@/server/infrastructure/repositories/push-subscription";
import { getUserOrThrow } from "@/server/middleware/auth";
import { buildPublicUrl } from "@/server/utils/r2";

const CHAIN_RESET_HOUR = 4;
const JST_OFFSET_MINUTES = 9 * 60;
const TROPHY_IDS = {
	totalTenth: "1",
	dailyTenth: "2",
} as const;

const getChainDayRange = (now = new Date()) => {
	const offsetMs = JST_OFFSET_MINUTES * 60 * 1000;
	const nowJst = new Date(now.getTime() + offsetMs);
	const jstYear = nowJst.getUTCFullYear();
	const jstMonth = nowJst.getUTCMonth();
	const jstDate = nowJst.getUTCDate();
	const jstHour = nowJst.getUTCHours();

	const baseStartJst = new Date(
		Date.UTC(jstYear, jstMonth, jstDate, CHAIN_RESET_HOUR),
	);
	const startJst =
		jstHour < CHAIN_RESET_HOUR
			? new Date(Date.UTC(jstYear, jstMonth, jstDate - 1, CHAIN_RESET_HOUR))
			: baseStartJst;
	const startUtc = new Date(startJst.getTime() - offsetMs);
	const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
	const chainDayKey = startJst.toISOString().slice(0, 10);

	return { startUtc, endUtc, chainDayKey };
};

const isJoinBlockedWindow = (now = new Date()) => {
	const offsetMs = JST_OFFSET_MINUTES * 60 * 1000;
	const nowJst = new Date(now.getTime() + offsetMs);
	const hour = nowJst.getUTCHours();
	return hour >= 22 || hour < 4;
};

const chainsRoute = createHonoApp()
	.get("/users", async (c) => {
		await getUserOrThrow(c);
		const { publicUrl } = c.get("r2");
		const { startUtc, endUtc } = getChainDayRange();

		// チェーンに参加しているユーザーを取得
		const chainUsers = await db
			.select({
				id: users.id,
				name: users.name,
				imagePath: users.imageUrl,
			})
			.from(chains)
			.innerJoin(users, eq(chains.userId, users.id))
			.where(and(gte(chains.joinedAt, startUtc), lt(chains.joinedAt, endUtc)));

		return c.json({
			users: chainUsers.map((user) => ({
				id: user.id,
				name: user.name,
				image: buildPublicUrl(publicUrl, user.imagePath),
			})),
		});
	})
	.post("/join", async (c) => {
		const { user } = await getUserOrThrow(c);
		const messages: string[] = [];
		const now = new Date();
		if (isJoinBlockedWindow(now)) {
			return c.json(
				{
					success: false,
					joined: false,
					messages: ["Chain join is closed between 22:00 and 4:00 JST"],
				},
				403,
			);
		}
		const { startUtc, endUtc, chainDayKey } = getChainDayRange(now);

		try {
			const joinResult = await db.transaction(async (tx) => {
				await tx.execute(
					sql`select pg_advisory_xact_lock(hashtext(${chainDayKey}))`,
				);
				const [existingChain] = await tx
					.select({ id: chains.id })
					.from(chains)
					.where(
						and(
							eq(chains.userId, user.id),
							gte(chains.joinedAt, startUtc),
							lt(chains.joinedAt, endUtc),
						),
					)
					.limit(1);

				if (existingChain) {
					return {
						alreadyJoined: true,
						awardedCardId: null,
						awardedTrophyIds: [],
					};
				}

				await tx.insert(chains).values({
					id: uuidv7(),
					userId: user.id,
					joinedAt: now,
				});

				const [randomCard] = await tx
					.select({ id: cards.id })
					.from(cards)
					.orderBy(sql`random()`)
					.limit(1);

				let awardedCardId: string | null = null;
				if (randomCard) {
					awardedCardId = randomCard.id;
					await tx.insert(cardUsers).values({
						id: uuidv7(),
						cardId: randomCard.id,
						userId: user.id,
						isAcquired: true,
					});
				}

				const [{ count: totalJoinCountRaw }] = await tx
					.select({ count: sql<number>`count(*)` })
					.from(chains)
					.where(eq(chains.userId, user.id));

				const [{ count: dailyJoinCountRaw }] = await tx
					.select({ count: sql<number>`count(*)` })
					.from(chains)
					.where(
						and(gte(chains.joinedAt, startUtc), lt(chains.joinedAt, endUtc)),
					);

				const totalJoinCount = Number(totalJoinCountRaw);
				const dailyJoinCount = Number(dailyJoinCountRaw);

				const awardedTrophyIds: string[] = [];
				if (totalJoinCount === 10) {
					await tx.insert(userTrophies).values({
						id: uuidv7(),
						userId: user.id,
						trophyId: TROPHY_IDS.totalTenth,
						isCompleted: true,
						progress: 100,
					});
					awardedTrophyIds.push(TROPHY_IDS.totalTenth);
				}

				if (dailyJoinCount === 10) {
					await tx.insert(userTrophies).values({
						id: uuidv7(),
						userId: user.id,
						trophyId: TROPHY_IDS.dailyTenth,
						isCompleted: true,
						progress: 100,
					});
					awardedTrophyIds.push(TROPHY_IDS.dailyTenth);
				}

				return {
					alreadyJoined: false,
					awardedCardId,
					awardedTrophyIds,
				};
			});

			if (joinResult.alreadyJoined) {
				return c.json({
					success: true,
					joined: false,
					messages: ["Already joined today"],
					card_id: null,
					awarded_trophy_ids: [],
				});
			}

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
				card_id: joinResult.awardedCardId,
				awarded_trophy_ids: joinResult.awardedTrophyIds,
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
		const { publicUrl } = c.get("r2");
		const { startUtc, endUtc } = getChainDayRange();

		// チェーンに参加している全ユーザーを取得（フォロー中を優先）
		const chainUsersWithFollowStatus = await db
			.select({
				chainId: chains.id,
				userId: users.id,
				userName: users.name,
				userIconPath: users.imageUrl,
				isFollowing: followers.followerId,
				joinedAt: chains.joinedAt,
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
			.where(and(gte(chains.joinedAt, startUtc), lt(chains.joinedAt, endUtc)));
		const joined = chainUsersWithFollowStatus.some(
			(userItem) => userItem.userId === user.id,
		);

		// フォロー中のユーザーを最初に、それ以外をランダムにソート
		const chainUsersWithIcons = chainUsersWithFollowStatus.map((userItem) => ({
			...userItem,
			userIcon: buildPublicUrl(publicUrl, userItem.userIconPath),
		}));

		const sortedByJoinedAt = [...chainUsersWithIcons].sort((a, b) => {
			const diff = a.joinedAt.getTime() - b.joinedAt.getTime();
			if (diff !== 0) {
				return diff;
			}
			return a.chainId.localeCompare(b.chainId);
		});
		const usersForResponse = sortedByJoinedAt.map((userItem, index) => ({
			id: userItem.userId,
			name: userItem.userName,
			image: userItem.userIcon ?? "",
			rank: index + 1,
			is_following:
				userItem.userId !== user.id && userItem.isFollowing !== null,
		}));
		const myRank =
			usersForResponse.find((userItem) => userItem.id === user.id)?.rank ??
			null;

		const followingUsers = chainUsersWithIcons.filter(
			(u) => u.isFollowing !== null && u.userId !== user.id,
		);
		const otherUsers = chainUsersWithIcons.filter(
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
		const fallbackUsers =
			sortedUsers.length > 0
				? sortedUsers
				: chainUsersWithIcons.filter((u) => u.userId === user.id);

		const topUser = fallbackUsers[0];
		const iconUsers = fallbackUsers.slice(0, 2);

		return c.json({
			joined,
			label: {
				count: chainUsersWithIcons.length,
				top_user_name: topUser?.userName ?? "",
				top_user_icon: topUser?.userIcon ?? "",
				icons: iconUsers.map((u) => u.userIcon ?? ""),
			},
			users: usersForResponse,
			my_rank: myRank,
		});
	});

export default chainsRoute;
