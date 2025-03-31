import { DragDropContext, type DropResult } from "@hello-pangea/dnd";
import { and, asc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { useRevalidator } from "react-router";
import { db } from "~/database/.client";
import { boards, columns, issueTags, issues } from "~/database/.client/schema";
import type { Route } from "./+types/route";
import { ColumnList } from "./components/ColumnList";
import { Filters } from "./components/Filters";
import { loadSearchParams } from "./search-params";

export function meta({ data }: Route.MetaArgs) {
  const title = data?.board?.title
    ? `${data.board.title} - Scrum`
    : "Loading... - Scrum";

  return [
    { title },
    { name: "description", content: "A Scrum for your everyday life!" },
  ];
}

export async function clientLoader({
  params,
  request,
}: Route.ClientLoaderArgs) {
  const boardId = Number(params.boardId);
  if (Number.isNaN(boardId)) throw new Response("Not Found", { status: 404 });

  const { search, tags: filterTags } = loadSearchParams(request);

  console.log(search, filterTags);

  const board = await db.query.boards.findFirst({
    where: eq(boards.id, boardId),
    with: {
      columns: {
        orderBy: asc(columns.rank),
        with: {
          issues: {
            orderBy: asc(issues.rank),
            with: { tags: true },

            where: and(
              search.length
                ? or(
                    ilike(issues.title, `%${search}%`),
                    ilike(issues.description, `%${search}%`),
                  )
                : undefined,

              filterTags.length
                ? inArray(
                    issues.id,
                    db
                      .select({ id: issueTags.issueId })
                      .from(issueTags)
                      .groupBy(issueTags.issueId)
                      .having(sql`COUNT(*) = ${filterTags.length}`)
                      .where(inArray(issueTags.tagId, filterTags)),
                  )
                : undefined,
            ),
          },
        },
      },
    },
  });

  if (!board) throw new Response("Not Found", { status: 404 });

  const tags = await db.query.tags.findMany();

  return { board, tags };
}

export default function Board({ loaderData: { board } }: Route.ComponentProps) {
  const revalidator = useRevalidator();

  async function onDragEnd(result: DropResult) {
    const { source, destination } = result;

    const sourceColumnId = Number(source.droppableId);
    const sourceColumnIndex = board.columns.findIndex(
      (column) => column.id === sourceColumnId,
    );

    const sourceIndex = source.index;

    const destinationColumnId = destination
      ? Number(destination.droppableId)
      : sourceColumnId;

    const destinationColumnIndex = board.columns.findIndex(
      (column) => column.id === destinationColumnId,
    );

    const destinationIndex = destination
      ? destination.index
      : board.columns[destinationColumnIndex].issues.length;

    if (
      sourceColumnIndex === destinationColumnIndex &&
      sourceIndex === destinationIndex
    )
      return;

    const [removedIssue] = board.columns[sourceColumnIndex].issues.splice(
      sourceIndex,
      1,
    );

    board.columns[destinationColumnIndex].issues.splice(
      destinationIndex,
      0,
      removedIssue,
    );

    await db
      .update(issues)
      .set({
        columnId: destinationColumnId,
        rank: generateKeyBetween(
          board.columns[destinationColumnIndex].issues[destinationIndex - 1]
            ?.rank,

          board.columns[destinationColumnIndex].issues[destinationIndex + 1]
            ?.rank,
        ),
      })
      .where(eq(issues.id, removedIssue.id));

    await revalidator.revalidate();
  }

  return (
    <div className="flex h-full flex-col px-6 pt-6">
      <header className="mb-8 flex w-full flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            {board.title}
          </h1>
          {board.description && (
            <p className="mt-1 text-muted-foreground">{board.description}</p>
          )}
        </div>
        <Filters />
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <ColumnList board={board} />
      </DragDropContext>
    </div>
  );
}
