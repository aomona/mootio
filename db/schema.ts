import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("users", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").notNull().default(false),
	bio: text("bio"),
	image: text("image"),
	imageUrl: text("img_url"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

// 後方互換性のためのエイリアス
export const users = user;

export const chains = pgTable("chains", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	joinedAt: timestamp("joined_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const followers = pgTable(
	"followers",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		followeeId: text("followee_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({
			columns: [table.followerId, table.followeeId],
		}),
	],
);

export const trophies = pgTable("trophies", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	modelUrl: text("model_url"),
	thumbnailUrl: text("thumbnail_url"),
});

export const userTrophies = pgTable("user_trophies", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	trophyId: text("trophy_id")
		.notNull()
		.references(() => trophies.id, { onDelete: "cascade" }),
	isCompleted: boolean("is_completed").notNull().default(false),
	progress: integer("progress").notNull().default(0),
	awardedAt: timestamp("awarded_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const cards = pgTable("cards", {
	id: text("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content"),
	event: text("event"),
	rarity: text("rarity"),
});

export const cardUsers = pgTable("card_users", {
	id: text("id").primaryKey(),
	cardId: text("card_id")
		.notNull()
		.references(() => cards.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	isAcquired: boolean("is_acquired").notNull().default(false),
});

export const usersRelations = relations(users, ({ many }) => ({
	chains: many(chains),
	following: many(followers, {
		relationName: "following",
	}),
	followers: many(followers, {
		relationName: "followers",
	}),
	userTrophies: many(userTrophies),
	cardUsers: many(cardUsers),
	sessions: many(session),
	accounts: many(account),
	pushSubscriptions: many(pushSubscription),
}));

export const chainsRelations = relations(chains, ({ one }) => ({
	user: one(users, {
		fields: [chains.userId],
		references: [users.id],
	}),
}));

export const followersRelations = relations(followers, ({ one }) => ({
	follower: one(users, {
		fields: [followers.followerId],
		references: [users.id],
		relationName: "following",
	}),
	followee: one(users, {
		fields: [followers.followeeId],
		references: [users.id],
		relationName: "followers",
	}),
}));

export const userTrophiesRelations = relations(userTrophies, ({ one }) => ({
	user: one(users, {
		fields: [userTrophies.userId],
		references: [users.id],
	}),
	trophy: one(trophies, {
		fields: [userTrophies.trophyId],
		references: [trophies.id],
	}),
}));

export const cardUsersRelations = relations(cardUsers, ({ one }) => ({
	user: one(users, {
		fields: [cardUsers.userId],
		references: [users.id],
	}),
	card: one(cards, {
		fields: [cardUsers.cardId],
		references: [cards.id],
	}),
}));

export const session = pgTable(
	"session",
	{
		id: text("id").primaryKey(),
		expiresAt: timestamp("expires_at").notNull(),
		token: text("token").notNull().unique(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text("ip_address"),
		userAgent: text("user_agent"),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
	},
	(table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
	"account",
	{
		id: text("id").primaryKey(),
		accountId: text("account_id").notNull(),
		providerId: text("provider_id").notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		accessToken: text("access_token"),
		refreshToken: text("refresh_token"),
		idToken: text("id_token"),
		accessTokenExpiresAt: timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
		scope: text("scope"),
		password: text("password"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
	"verification",
	{
		id: text("id").primaryKey(),
		identifier: text("identifier").notNull(),
		value: text("value").notNull(),
		expiresAt: timestamp("expires_at").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const files = pgTable("files", {
	id: text("id").primaryKey().notNull(),
	bucket: varchar("bucket", { length: 255 }).notNull(),
	key: varchar("key", { length: 1024 }).notNull(),
	contentType: varchar("content_type", { length: 255 }).notNull(),
	size: bigint("size", { mode: "number" }).notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true }),
	uploadedAt: timestamp("uploaded_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const pushSubscription = pgTable(
	"push_subscription",
	{
		id: text("id").primaryKey().notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		endpoint: text("endpoint").notNull(),
		p256dh: text("p256dh").notNull(),
		auth: text("auth").notNull(),
		expirationTime: bigint("expiration_time", { mode: "number" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("push_subscription_userId_idx").on(table.userId),
		uniqueIndex("push_subscription_userId_endpoint_idx").on(
			table.userId,
			table.endpoint,
		),
	],
);

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(users, {
		fields: [session.userId],
		references: [users.id],
	}),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(users, {
		fields: [account.userId],
		references: [users.id],
	}),
}));

export const pushSubscriptionRelations = relations(
	pushSubscription,
	({ one }) => ({
		user: one(users, {
			fields: [pushSubscription.userId],
			references: [users.id],
		}),
	}),
);
