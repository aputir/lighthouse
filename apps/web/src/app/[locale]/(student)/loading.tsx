import { Card, Skeleton } from "@lighthouse/ui";

export default function StudentLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="p-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </Card>
        <Card className="p-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </Card>
      </div>
      <Card className="p-6">
        <Skeleton className="mb-2 h-4 w-32" />
        <Skeleton className="h-6 w-64" />
      </Card>
    </div>
  );
}
