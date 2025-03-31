import type {
  boards,
  columns,
  issueTags,
  issues,
} from "~/database/.client/schema";
import { cn } from "~/lib/utils";
import { Column } from "./Column";
import { CreateColumnDialog } from "./CreateColumnDialog";

export function ColumnList({
  board,
}: {
  board: typeof boards.$inferSelect & {
    columns: (typeof columns.$inferSelect & {
      issues: (typeof issues.$inferSelect & {
        tags: (typeof issueTags.$inferSelect)[];
      })[];
    })[];
  };
}) {
  return (
    <div className="flex h-full w-full gap-3 overflow-x-auto overflow-y-hidden">
      {board.columns.map((column, index) => (
        <Column
          key={column.id}
          column={column}
          isFirst={index === 0}
          isLast={index === board.columns.length - 1}
        />
      ))}

      <div className={cn("w-80 flex-shrink-0")}>
        <div className="mb-3 flex items-center justify-between">
          <CreateColumnDialog board={board} />
        </div>
      </div>
    </div>
  );
}
