CREATE TABLE "acap_revenue" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" real NOT NULL,
	"description" text,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"path" text NOT NULL,
	"selector" text,
	"section" text,
	"content" text NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"resolvedAt" timestamp,
	"resolvedBy" text,
	"parentId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_setting" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"label" text NOT NULL,
	"description" text,
	"type" text DEFAULT 'text' NOT NULL,
	"group" text DEFAULT 'general' NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"updatedBy" text,
	CONSTRAINT "site_setting_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "task" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'todo' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"assignedTo" text,
	"createdBy" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"tags" jsonb,
	"dueDate" timestamp,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"taskId" text NOT NULL,
	"userId" text NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "investorType" text;--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "expectedProfit" real;--> statement-breakpoint
ALTER TABLE "signal" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_userId_unique" UNIQUE("userId");