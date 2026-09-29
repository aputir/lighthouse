import { Card, CardContent, CardHeader, Skeleton } from "@lighthouse/ui";

export default function LoginLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-sunken p-4">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </main>
  );
}
