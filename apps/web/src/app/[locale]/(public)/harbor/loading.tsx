import { Card, Skeleton } from "@lighthouse/ui";

export default function HarborLoading() {
  return (
    <main className="relative min-h-screen overflow-hidden harbor-world-bg p-6 text-slate-100 md:p-10">
      <header className="relative z-10 mx-auto mb-8 max-w-2xl text-center space-y-3">
        <div className="flex justify-center">
          <Skeleton className="h-6 w-28 rounded-full bg-slate-800" />
        </div>
        <Skeleton className="mx-auto h-9 w-64 bg-slate-800" />
        <Skeleton className="mx-auto h-4 w-96 max-w-full bg-slate-800" />
      </header>
      <div className="relative z-10 mx-auto max-w-5xl space-y-8">
        <div className="flex justify-center">
          <Skeleton className="h-10 w-48 rounded-lg bg-slate-800" />
        </div>
        <Card className="border-slate-800 bg-slate-900/60 p-8">
          <Skeleton className="h-64 w-full bg-slate-800" />
        </Card>
      </div>
    </main>
  );
}
