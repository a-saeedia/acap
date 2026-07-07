CREATE TABLE "referral" (
	"id" text PRIMARY KEY NOT NULL,
	"referrerId" text NOT NULL,
	"referredId" text NOT NULL,
	"email" text,
	"status" text DEFAULT 'active' NOT NULL,
	"rewardMilestone" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "referralCode" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD COLUMN "referredBy" text;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_referralCode_unique" UNIQUE("referralCode");