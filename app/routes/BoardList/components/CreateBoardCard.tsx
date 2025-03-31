import { PlusIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export function CreateBoardCard({
  setOpen,
}: { setOpen: (value: boolean) => void }) {
  return (
    <Card
      className="flex h-full cursor-pointer flex-col items-center justify-center border-border border-dashed bg-background transition-all hover:bg-secondary/20 hover:shadow-md"
      onClick={() => setOpen(true)}
    >
      <CardContent className="flex h-full flex-col items-center justify-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <PlusIcon className="h-6 w-6" />
        </div>
        <p className="text-center font-medium">Create New Board</p>
      </CardContent>
    </Card>
  );
}
