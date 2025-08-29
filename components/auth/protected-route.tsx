'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from './auth-provider'
import { Loading } from '@/components/ui/loading'

interface ProtectedRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/signin')
        }
    }, [user, loading, router])

    if (loading) {
        return fallback || <Loading size="lg" text="Checking authentication..." />
    }

    if (!user) {
        return null
    }

    return <>{children}</>
}
