CREATE TABLE "tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"color" varchar(7) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "issue_tags_issue_id_name_idx";--> statement-breakpoint
ALTER TABLE "issue_tags" ADD COLUMN "tag_id" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_name_idx" ON "tags" USING btree ("name");--> statement-breakpoint
ALTER TABLE "issue_tags" ADD CONSTRAINT "issue_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "issue_tags_issue_id_tag_id_idx" ON "issue_tags" USING btree ("issue_id","tag_id");--> statement-breakpoint
ALTER TABLE "issue_tags" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "issue_tags" DROP COLUMN "color";