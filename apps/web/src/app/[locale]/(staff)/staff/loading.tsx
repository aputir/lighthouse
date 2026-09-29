import { Card, Skeleton } from "@lighthouse/ui";

const SKELETON_ITEMS = ["card-1", "card-2", "card-3", "card-4", "card-5", "card-6"];

export default function StaffLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SKELETON_ITEMS.map((id) => (
          <Card key={id} className="p-6">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-6 w-16" />
          </Card>
        ))}
      </div>
    </div>
  );
}
