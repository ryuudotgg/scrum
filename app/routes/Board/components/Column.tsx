import type { columns, issueTags, issues } from "~/database/.client/schema";
import { ColumnMenu } from "./ColumnMenu";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { IssueList } from "./IssueList";

export function Column({
  column,
  isFirst,
  isLast,
}: {
  column: typeof columns.$inferSelect & {
    issues: (typeof issues.$inferSelect & {
      tags: (typeof issueTags.$inferSelect)[];
    })[];
  };

  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex h-full w-full items-center gap-2">
          <span className="text-sm">{column.title}</span>
        </div>
        <div className="flex gap-1 text-muted-foreground">
          <ColumnMenu column={column} isFirst={isFirst} isLast={isLast} />
          <CreateIssueDialog column={column} variant="ghost" />
        </div>
      </div>

      <IssueList column={column} />
    </div>
  );
}
