import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { eq } from "drizzle-orm";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useRevalidator } from "react-router";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { db } from "~/database/.client";
import { boards } from "~/database/.client/schema";

dayjs.extend(relativeTime);

export default function BoardCard({
  board,
}: { board: typeof boards.$inferSelect }) {
  const revalidator = useRevalidator();

  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    setIsDeleting(true);

    const [deleted] = await db
      .delete(boards)
      .where(eq(boards.id, board.id))
      .returning({ id: boards.id });

    if (!deleted) {
      toast.error("Something went wrong, please try again.");
      return setIsDeleting(false);
    }

    await revalidator.revalidate();

    setIsDeleting(false);
  }

  return (
    <AlertDialog open={isOpen}>
      <Link to={`/boards/${board.id}`}>
        <Card className="relative block h-full cursor-pointer border border-border bg-background transition-all hover:bg-secondary/20 hover:shadow-md">
          <div className="absolute top-3 right-3">
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="size-8 rounded-md hover:text-destructive"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();

                  setIsOpen(true);
                }}
              >
                <Trash2 className="size-4" />
                <span className="sr-only">Delete Board</span>
              </Button>
            </AlertDialogTrigger>
          </div>

          <CardHeader className="gap-0 pb-2">
            <CardTitle className="text-2xl">{board.title}</CardTitle>
          </CardHeader>

          {board.description && (
            <CardContent className="p-6 pt-0">
              <p className="text-muted-foreground">{board.description}</p>
            </CardContent>
          )}

          <CardFooter className="px-6">
            <p className="text-muted-foreground/80 text-xs">
              Updated {dayjs(board.updatedAt).fromNow()}
            </p>
          </CardFooter>
        </Card>
      </Link>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            board and all data within it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={onDelete}
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
