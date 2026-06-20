/**
 * Loading placeholder that mirrors the ProductCard layout so the grid doesn't
 * jump when real products arrive.
 */
export default function ProductCardSkeleton() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="skeleton aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="skeleton h-5 w-2/3 rounded-md" />
          <div className="skeleton h-5 w-12 rounded-md" />
        </div>
        <div className="skeleton h-3 w-1/3 rounded-md" />
        <div className="skeleton h-3 w-full rounded-md" />
        <div className="skeleton h-3 w-4/5 rounded-md" />
        <div className="mt-2 flex items-center gap-2">
          <div className="skeleton h-10 flex-1 rounded-pill" />
          <div className="skeleton h-11 w-11 rounded-pill" />
        </div>
      </div>
    </div>
  );
}
