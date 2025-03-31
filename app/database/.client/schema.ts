import { relations } from "drizzle-orm";
import { unique } from "drizzle-orm/pg-core";
import { text, varchar } from "drizzle-orm/pg-core";
import {
  foreignKey,
  index,
  integer,
  pgTable,
  serial,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { dates } from "./helpers";

export const boards = pgTable(
  "boards",
  {
    id: serial().primaryKey(),

    title: varchar({ length: 255 }).notNull(),
    description: text(),

    ...dates,
  },
  (board) => [unique("boards_title_unique").on(board.title)],
);

export const boardsRelations = relations(boards, ({ many }) => ({
  columns: many(columns),
}));

export const columns = pgTable(
  "columns",
  {
    id: serial().primaryKey(),
    boardId: integer().notNull(),

    title: varchar({ length: 255 }).notNull(),
    rank: varchar({ length: 255 }).notNull(),

    ...dates,
  },
  (column) => [
    unique("columns_board_id_title_unique").on(column.boardId, column.title),

    index("columns_board_id_idx").on(column.boardId),
    uniqueIndex("columns_board_id_rank_idx").on(column.boardId, column.rank),

    foreignKey({
      name: "columns_board_id_fk",
      columns: [column.boardId],
      foreignColumns: [boards.id],
    }).onDelete("cascade"),
  ],
);

export const columnsRelations = relations(columns, ({ many, one }) => ({
  issues: many(issues),

  board: one(boards, {
    fields: [columns.boardId],
    references: [boards.id],
  }),
}));

export const issues = pgTable(
  "issues",
  {
    id: serial().primaryKey(),
    columnId: integer().notNull(),

    title: varchar({ length: 255 }).notNull(),
    description: text(),

    rank: varchar({ length: 255 }).notNull(),

    ...dates,
  },
  (issue) => [
    index("issues_column_id_idx").on(issue.columnId),
    uniqueIndex("issues_column_id_rank_idx").on(issue.columnId, issue.rank),

    foreignKey({
      name: "issues_column_id_fk",
      columns: [issue.columnId],
      foreignColumns: [columns.id],
    }).onDelete("cascade"),
  ],
);

export const issuesRelations = relations(issues, ({ many, one }) => ({
  tags: many(issueTags),

  column: one(columns, {
    fields: [issues.columnId],
    references: [columns.id],
  }),
}));

export const tags = pgTable(
  "tags",
  {
    id: serial().primaryKey(),
    name: varchar({ length: 255 }).notNull(),

    ...dates,
  },
  (tag) => [uniqueIndex("tags_name_idx").on(tag.name)],
);

export const issueTags = pgTable(
  "issue_tags",
  {
    id: serial().primaryKey(),

    issueId: integer().notNull(),
    tagId: integer().notNull(),

    ...dates,
  },
  (issue) => [
    index("issue_tags_issue_id_idx").on(issue.issueId),
    uniqueIndex("issue_tags_issue_id_tag_id_idx").on(
      issue.issueId,
      issue.tagId,
    ),

    foreignKey({
      name: "issue_tags_issue_id_fk",
      columns: [issue.issueId],
      foreignColumns: [issues.id],
    }).onDelete("cascade"),

    foreignKey({
      name: "issue_tags_tag_id_fk",
      columns: [issue.tagId],
      foreignColumns: [tags.id],
    }).onDelete("cascade"),
  ],
);

export const issueTagsRelations = relations(issueTags, ({ one }) => ({
  issue: one(issues, {
    fields: [issueTags.issueId],
    references: [issues.id],
  }),

  tag: one(tags, {
    fields: [issueTags.tagId],
    references: [tags.id],
  }),
}));
