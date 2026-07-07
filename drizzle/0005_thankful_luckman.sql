ALTER TABLE "referral" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "referral" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "referral" ADD COLUMN "rewardAmount" real;--> statement-breakpoint
ALTER TABLE "referral" ADD COLUMN "convertedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "totalRewards" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "referralLevel" integer DEFAULT 1;