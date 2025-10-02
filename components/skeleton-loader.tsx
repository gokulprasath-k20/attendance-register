interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

export function AttendanceTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-purple-50">
          <tr>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-24" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-16" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-3 w-16" />
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i}>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-24" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-6 py-4">
                <Skeleton className="h-6 w-16 rounded-full" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
