ALTER TABLE "acap_revenue" ADD COLUMN "type" text DEFAULT 'general' NOT NULL;--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "visibility" text DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "targetUserIds" jsonb;--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "audience" text DEFAULT 'general' NOT NULL;