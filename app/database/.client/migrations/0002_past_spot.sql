CREATE INDEX "columns_board_id_idx" ON "columns" USING btree ("board_id");--> statement-breakpoint
CREATE INDEX "columns_rank_idx" ON "columns" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "columns_board_id_rank_idx" ON "columns" USING btree ("board_id","rank");--> statement-breakpoint
CREATE INDEX "issues_column_id_idx" ON "issues" USING btree ("column_id");--> statement-breakpoint
CREATE INDEX "issues_rank_idx" ON "issues" USING btree ("rank");--> statement-breakpoint
CREATE INDEX "issues_column_id_rank_idx" ON "issues" USING btree ("column_id","rank");