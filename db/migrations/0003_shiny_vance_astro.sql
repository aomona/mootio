CREATE TABLE "card_users" (
	"card_id" text NOT NULL,
	"user_id" text NOT NULL,
	"is_acquired" boolean DEFAULT false NOT NULL,
	CONSTRAINT "card_users_card_id_user_id_pk" PRIMARY KEY("card_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text,
	"event" text,
	"rarity" text
);
--> statement-breakpoint
CREATE TABLE "chains" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"join_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"follower_id" text NOT NULL,
	"followee_id" text NOT NULL,
	CONSTRAINT "followers_follower_id_followee_id_pk" PRIMARY KEY("follower_id","followee_id")
);
--> statement-breakpoint
CREATE TABLE "trophies" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"model_url" text,
	"thumbnail_url" text
);
--> statement-breakpoint
CREATE TABLE "user_trophies" (
	"user_id" text NOT NULL,
	"trophy_id" text NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "user_trophies_user_id_trophy_id_pk" PRIMARY KEY("user_id","trophy_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"bio" text,
	"img_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "user" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user" CASCADE;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "card_users" ADD CONSTRAINT "card_users_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "card_users" ADD CONSTRAINT "card_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chains" ADD CONSTRAINT "chains_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "followers" ADD CONSTRAINT "followers_followee_id_users_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trophies" ADD CONSTRAINT "user_trophies_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_trophies" ADD CONSTRAINT "user_trophies_trophy_id_trophies_id_fk" FOREIGN KEY ("trophy_id") REFERENCES "public"."trophies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;