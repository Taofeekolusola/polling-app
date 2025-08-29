'use client'

import { useAuth as useAuthContext } from '@/components/auth/auth-provider'

export function useAuth() {
    return useAuthContext()
}

// Helper hook for checking if user is authenticated
export function useIsAuthenticated() {
    const { user, loading } = useAuth()
    return { isAuthenticated: !!user, loading }
}

// Helper hook for getting user profile data
export function useUserProfile() {
    const { user } = useAuth()
    return {
        id: user?.id,
        email: user?.email,
        fullName: user?.user_metadata?.full_name,
        isVerified: user?.email_confirmed_at,
    }
}

