CREATE TABLE "article" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"excerpt" text NOT NULL,
	"content" text NOT NULL,
	"categoryId" text,
	"author" text DEFAULT 'تیم A|CAP' NOT NULL,
	"authorRole" text DEFAULT 'تحلیلگر بازارهای مالی',
	"image" text,
	"tags" jsonb,
	"readingTime" integer DEFAULT 5 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"publishedAt" timestamp DEFAULT now() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "article_category" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#3B82F6',
	"icon" text DEFAULT 'BookOpen',
	"order" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "article_category_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"longDescription" text,
	"category" text NOT NULL,
	"instructor" text NOT NULL,
	"instructorName" text NOT NULL,
	"price" bigint DEFAULT 0 NOT NULL,
	"originalPrice" bigint,
	"duration" text,
	"level" text DEFAULT 'beginner' NOT NULL,
	"lessons" integer DEFAULT 0 NOT NULL,
	"videoHours" real DEFAULT 0,
	"thumbnail" text,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"icon" text DEFAULT 'BookOpen' NOT NULL,
	"isPopular" boolean DEFAULT false NOT NULL,
	"isNew" boolean DEFAULT false NOT NULL,
	"isBestseller" boolean DEFAULT false NOT NULL,
	"rating" real DEFAULT 0,
	"studentsCount" integer DEFAULT 0,
	"prerequisites" text,
	"whatYouLearn" jsonb,
	"syllabus" jsonb,
	"publishedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "course_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"courseId" text NOT NULL,
	"progress" real DEFAULT 0 NOT NULL,
	"completedLessons" integer DEFAULT 0 NOT NULL,
	"startedAt" timestamp DEFAULT now() NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_path" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"icon" text DEFAULT 'Compass' NOT NULL,
	"color" text DEFAULT '#3B82F6' NOT NULL,
	"image" text,
	"minScore" integer,
	"maxScore" integer,
	"investorType" text,
	"incomePotential" text,
	"timeToFirstIncome" text,
	"requiredCapital" text,
	"difficulty" text DEFAULT 'intermediate' NOT NULL,
	"courseIds" jsonb,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "learning_path_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "trialEndsAt" timestamp;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "requestedAt" timestamp;--> statement-breakpoint
ALTER TABLE "suggestion" ADD COLUMN "expiresAt" timestamp;--> statement-breakpoint
ALTER TABLE "suggestion" ADD COLUMN "actual_profit" real;