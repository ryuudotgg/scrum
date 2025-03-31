import { ArrowLeft, ArrowRight, MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DropdownMenuTrigger } from "~/components/ui/dropdown-menu";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";

import { asc, desc, eq, gt, lt } from "drizzle-orm";
import { generateKeyBetween } from "fractional-indexing";
import { useRevalidator } from "react-router";
import { DropdownMenu } from "~/components/ui/dropdown-menu";
import { db } from "~/database/.client";
import { columns } from "~/database/.client/schema";
import { DeleteColumnDialog } from "./DeleteColumnDialog";

export function ColumnMenu({
  column,
  isFirst,
  isLast,
}: {
  column: typeof columns.$inferSelect;
  isFirst: boolean;
  isLast: boolean;
}) {
  const revalidator = useRevalidator();

  async function onMoveLeft() {
    const [betweenTwo, betweenOne] = await db
      .select()
      .from(columns)
      .where(lt(columns.rank, column.rank))
      .orderBy(desc(columns.rank))
      .limit(2);

    console.log("One", betweenOne);
    console.log("Two", betweenTwo);

    await db
      .update(columns)
      .set({ rank: generateKeyBetween(betweenOne?.rank, betweenTwo?.rank) })
      .where(eq(columns.id, column.id));

    await revalidator.revalidate();
  }

  async function onMoveRight() {
    const [betweenOne, betweenTwo] = await db
      .select()
      .from(columns)
      .where(gt(columns.rank, column.rank))
      .orderBy(asc(columns.rank))
      .limit(2);

    console.log(betweenOne, betweenTwo);

    await db
      .update(columns)
      .set({ rank: generateKeyBetween(betweenOne?.rank, betweenTwo?.rank) })
      .where(eq(columns.id, column.id));

    await revalidator.revalidate();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" className="size-8 rounded-md">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">More Options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!isFirst && (
          <DropdownMenuItem onClick={onMoveLeft}>
            <ArrowLeft className="size-4" />
            Move Left
          </DropdownMenuItem>
        )}

        {!isLast && (
          <DropdownMenuItem onClick={onMoveRight}>
            <ArrowRight className="size-4" />
            Move Right
          </DropdownMenuItem>
        )}

        <DeleteColumnDialog column={column} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
