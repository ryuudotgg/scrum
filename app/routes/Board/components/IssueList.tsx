import { Droppable } from "@hello-pangea/dnd";
import type { columns, issueTags, issues } from "~/database/.client/schema";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { Issue } from "./Issue";

export function IssueList({
  column,
}: {
  column: typeof columns.$inferSelect & {
    issues: (typeof issues.$inferSelect & {
      tags: (typeof issueTags.$inferSelect)[];
    })[];
  };
}) {
  return (
    <Droppable droppableId={String(column.id)}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="no-scrollbar flex h-full w-full flex-col gap-2 overflow-y-auto overflow-x-hidden"
        >
          {column.issues.map((issue, index) => (
            <Issue key={issue.id} index={index} issue={issue} />
          ))}

          {provided.placeholder}

          <CreateIssueDialog column={column} variant="outline" />

          <div className="min-h-16" />
        </div>
      )}
    </Droppable>
  );
}
