import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import { db } from "~/database/.client";
import { boards } from "~/database/.client/schema";
import BoardCard from "~/routes/BoardList/components/BoardCard";
import { CreateBoardCard } from "~/routes/BoardList/components/CreateBoardCard";
import { CreateBoardDialog } from "~/routes/BoardList/components/CreateBoardDialog";
import type { Route } from "./+types/route";

export function meta() {
  return [
    { title: "Scrum" },
    { name: "description", content: "A Scrum for your everyday life!" },
  ];
}

export async function clientLoader() {
  return { rows: await db.select().from(boards) };
}

export default function BoardList({
  loaderData: { rows },
}: Route.ComponentProps) {
  const revalidator = useRevalidator();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      revalidator.revalidate();
    }, 2500);

    return () => clearInterval(interval);
  }, [revalidator]);

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-bold text-3xl text-foreground tracking-tight">
            My Boards
          </h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all your project boards
          </p>
        </div>
        <CreateBoardDialog open={open} setOpen={setOpen} />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((row) => (
          <BoardCard key={row.id} board={row} />
        ))}

        <CreateBoardCard setOpen={setOpen} />
      </div>
    </div>
  );
}
