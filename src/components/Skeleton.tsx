interface SkeletonProps {
    className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-white/5 rounded ${className}`} />
    )
}

export function TableSkeleton({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
    return (
        <div className="w-full p-4 space-y-4">
            {/* Header */}
            <div className="flex gap-4 pb-2 border-b border-[#2f2f2f]">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-32" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div key={rowIdx} className="flex gap-4" style={{ animationDelay: `${rowIdx * 50}ms` }}>
                    {Array.from({ length: columns }).map((_, colIdx) => (
                        <Skeleton
                            key={colIdx}
                            className={`h-8 ${colIdx === 0 ? 'w-48' : 'w-32'}`}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-white/5 space-y-4 animate-pulse">
            <div className="flex items-start justify-between">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-4 h-4 rounded" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="w-6 h-6 rounded-lg" />
            </div>
        </div>
    )
}

export function SidebarSkeleton() {
    return (
        <div className="p-4 space-y-4 animate-pulse">
            {/* Workspace */}
            <Skeleton className="h-14 w-full rounded-xl" />

            {/* Section title */}
            <Skeleton className="h-3 w-20 mt-6" />

            {/* Dashboard button */}
            <Skeleton className="h-10 w-full rounded-xl" />

            {/* Divider */}
            <div className="h-px bg-white/5 my-4" />

            {/* Section title */}
            <Skeleton className="h-3 w-24" />

            {/* Board items */}
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2">
                    <Skeleton className="w-2.5 h-2.5 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                </div>
            ))}
        </div>
    )
}
