export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i}
          className="h-3 bg-slate-700/50 rounded-md animate-shimmer"
          style={{ width: `${85 - i * 15}%`, animationDelay: `${i * 100}ms` }} />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-xl p-5 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-slate-700/50 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-slate-700/50 rounded w-2/3" />
          <div className="h-2 bg-slate-700/50 rounded w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonCircle({ size = 40, className = '' }) {
  return (
    <div className={`bg-slate-700/50 rounded-full animate-pulse ${className}`}
      style={{ width: size, height: size }} />
  );
}

export function SkeletonGrid({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="h-8 bg-slate-700/50 rounded-lg w-48 animate-pulse" />
      <div className="h-4 bg-slate-700/50 rounded w-72 animate-pulse" />
      <SkeletonGrid count={4} />
    </div>
  );
}

export default SkeletonCard;
