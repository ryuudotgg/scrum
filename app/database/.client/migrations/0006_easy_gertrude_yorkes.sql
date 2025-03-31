DROP INDEX "columns_rank_idx";--> statement-breakpoint
DROP INDEX "issues_rank_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "columns_rank_idx" ON "columns" USING btree ("rank");--> statement-breakpoint
CREATE UNIQUE INDEX "issues_rank_idx" ON "issues" USING btree ("rank");--> statement-breakpoint
ALTER TABLE "columns" ADD CONSTRAINT "columns_title_unique" UNIQUE("title");