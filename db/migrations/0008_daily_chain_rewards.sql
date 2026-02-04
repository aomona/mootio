ALTER TABLE "chains" ADD COLUMN "joined_at" timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE "chains" DROP COLUMN "join_count";

ALTER TABLE "card_users" ADD COLUMN "id" text;
UPDATE "card_users"
SET "id" = md5(random()::text || clock_timestamp()::text)
WHERE "id" IS NULL;
ALTER TABLE "card_users" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "card_users" DROP CONSTRAINT "card_users_card_id_user_id_pk";
ALTER TABLE "card_users" ADD CONSTRAINT "card_users_id_pk" PRIMARY KEY("id");

ALTER TABLE "user_trophies" ADD COLUMN "id" text;
UPDATE "user_trophies"
SET "id" = md5(random()::text || clock_timestamp()::text)
WHERE "id" IS NULL;
ALTER TABLE "user_trophies" ALTER COLUMN "id" SET NOT NULL;
ALTER TABLE "user_trophies" ADD COLUMN "awarded_at" timestamp with time zone NOT NULL DEFAULT now();
ALTER TABLE "user_trophies" DROP CONSTRAINT "user_trophies_user_id_trophy_id_pk";
ALTER TABLE "user_trophies" ADD CONSTRAINT "user_trophies_id_pk" PRIMARY KEY("id");
