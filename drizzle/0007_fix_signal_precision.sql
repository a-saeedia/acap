ALTER TABLE "signal" ALTER COLUMN "expectedProfit" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "signal" ALTER COLUMN "actualReturn" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "signal" ALTER COLUMN "priceAtPublish" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "signal" ALTER COLUMN "priceNow" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "suggestion" ADD COLUMN "imageUrl" text;--> statement-breakpoint
ALTER TABLE "suggestion" ADD COLUMN "audioUrl" text;