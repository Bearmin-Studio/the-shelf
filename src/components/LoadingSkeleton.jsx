'use client';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-white border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse">
          <div className="h-[180px] bg-gray-100" />
          <div className="p-4">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-200" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-100 rounded w-full mb-1" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
