interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
}

export function Skeleton({ width = '100%', height = 16, className = '' }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <Skeleton height={20} width="40%" />
      <Skeleton height={14} width="100%" />
      <Skeleton height={14} width="85%" />
      <Skeleton height={40} width="30%" className="mt-6" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="card">
          <div className="flex justify-between items-center">
            <Skeleton height={16} width="30%" />
            <Skeleton height={16} width="20%" />
          </div>
        </div>
      ))}
    </div>
  )
}
