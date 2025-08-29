import { cn } from "@/lib/utils"

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    text?: string
}

export function Loading({ size = 'md', className, text = 'Loading...' }: LoadingProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    return (
        <div className={cn("flex flex-col items-center justify-center", className)}>
            <div className={cn(
                "animate-spin rounded-full border-b-2 border-primary",
                sizeClasses[size]
            )} />
            {text && (
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
            )}
        </div>
    )
}

export function LoadingSpinner({ className }: { className?: string }) {
    return (
        <div className={cn("animate-spin rounded-full h-4 w-4 border-b-2 border-primary", className)} />
    )
}

