ALTER TABLE "columns" DROP CONSTRAINT "columns_title_unique";--> statement-breakpoint
DROP INDEX "columns_rank_idx";--> statement-breakpoint
DROP INDEX "issues_rank_idx";--> statement-breakpoint
DROP INDEX "columns_board_id_rank_idx";--> statement-breakpoint
DROP INDEX "issues_column_id_rank_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "columns_board_id_rank_idx" ON "columns" USING btree ("board_id","rank");--> statement-breakpoint
CREATE UNIQUE INDEX "issues_column_id_rank_idx" ON "issues" USING btree ("column_id","rank");--> statement-breakpoint
ALTER TABLE "columns" ADD CONSTRAINT "columns_board_id_title_unique" UNIQUE("board_id","title");