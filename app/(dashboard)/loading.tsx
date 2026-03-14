import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen px-6 pb-10 pt-6">
      <div className="mx-auto flex max-w-7xl gap-6">
        <Skeleton className="hidden h-[640px] w-72 rounded-[32px] md:block" />
        <div className="flex w-full flex-1 flex-col gap-6">
          <Skeleton className="h-20 rounded-[28px]" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-96 rounded-[24px]" />
        </div>
      </div>
    </div>
  );
}
