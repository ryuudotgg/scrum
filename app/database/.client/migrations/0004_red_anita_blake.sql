ALTER TABLE "boards" RENAME COLUMN "name" TO "title";--> statement-breakpoint
ALTER TABLE "boards" ADD CONSTRAINT "boards_title_unique" UNIQUE("title");