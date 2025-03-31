import { Draggable } from "@hello-pangea/dnd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState } from "react";
import { useLoaderData } from "react-router";
import { Badge } from "~/components/ui/badge";
import { CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Card } from "~/components/ui/card";
import type { issueTags, issues } from "~/database/.client/schema";
import type { tags as dbTags } from "~/database/.client/schema";
import type { clientLoader } from "../route";
import { UpdateIssueDialog } from "./UpdateIssueDialog";

dayjs.extend(relativeTime);

const MAX_TAGS = 2;

export function Issue({
  index,
  issue,
}: {
  index: number;
  issue: typeof issues.$inferSelect & {
    tags: (typeof issueTags.$inferSelect)[];
  };
}) {
  const { tags: tagOptions } = useLoaderData<typeof clientLoader>();

  const tags = issue.tags
    .map((issueTag) => tagOptions.find((tag) => tag.id === issueTag.tagId))
    .filter(Boolean) as (typeof dbTags.$inferSelect)[];

  const [open, setOpen] = useState(false);

  return (
    <Draggable key={issue.id} index={index} draggableId={String(issue.id)}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="mr-4 w-80 flex-shrink-0"
        >
          <Card
            {...provided.dragHandleProps}
            onClick={() => setOpen(true)}
            className="relative block h-full cursor-pointer border border-border bg-background transition-all hover:bg-secondary/20 hover:shadow-md"
          >
            <CardHeader className="flex items-center justify-start gap-2 pb-2">
              <CardTitle className="whitespace-nowrap text-2xl">
                {issue.title}
              </CardTitle>
              <div className="flex flex-nowrap items-center gap-1">
                {tags.slice(0, MAX_TAGS).map((tag) => (
                  <Badge key={tag.id}>{tag.name}</Badge>
                ))}

                {tags.length > MAX_TAGS && (
                  <Badge className="border-foreground/1 bg-transparent text-foreground hover:bg-transparent">
                    {`+ ${tags.length - MAX_TAGS} more`}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardFooter className="flex flex-col items-start gap-2 px-6">
              <p className="text-muted-foreground text-sm">
                Updated {dayjs(issue.updatedAt).fromNow()}
              </p>
            </CardFooter>
          </Card>

          <UpdateIssueDialog issue={issue} open={open} setOpen={setOpen} />
        </div>
      )}
    </Draggable>
  );
}
