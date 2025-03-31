import { Trash2 } from "lucide-react";

import { eq } from "drizzle-orm";
import { useState } from "react";
import { useRevalidator } from "react-router";
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
import { DropdownMenuItem } from "~/components/ui/dropdown-menu";
import { db } from "~/database/.client";
import { columns } from "~/database/.client/schema";

export function DeleteColumnDialog({
  column,
}: { column: typeof columns.$inferSelect }) {
  const revalidator = useRevalidator();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onDelete() {
    setIsDeleting(true);

    const [deleted] = await db
      .delete(columns)
      .where(eq(columns.id, column.id))
      .returning({ id: columns.id });

    if (!deleted) {
      toast.error("Something went wrong, please try again.");
      return setIsDeleting(false);
    }

    await revalidator.revalidate();

    setIsDeleting(false);
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <DropdownMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Delete Column
        </DropdownMenuItem>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            column and all issues within it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
