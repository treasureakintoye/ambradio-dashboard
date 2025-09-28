export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-24 bg-muted animate-pulse rounded" />
      </div>

      <div className="space-y-6">
        <div className="flex space-x-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded" />
          ))}
        </div>

        <div className="space-y-6">
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
          <div className="h-48 bg-muted animate-pulse rounded-lg" />
        </div>

        <div className="flex justify-end">
          <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </div>
  )
}
