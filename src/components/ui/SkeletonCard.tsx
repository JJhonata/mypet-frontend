export function SkeletonCard() {
  return (
    <div className="figma-card p-4 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-white/30 rounded w-3/4"></div>
          <div className="h-3 bg-white/20 rounded w-1/2"></div>
          <div className="h-3 bg-white/20 rounded w-2/3"></div>
        </div>
        <div className="h-8 w-8 bg-white/20 rounded"></div>
      </div>
    </div>
  );
}
