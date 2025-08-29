import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/auth-helpers'

interface AuthGuardProps {
    children: React.ReactNode
    requireAuth?: boolean
    redirectTo?: string
}

export async function AuthGuard({
    children,
    requireAuth = true,
    redirectTo = '/signin'
}: AuthGuardProps) {
    const user = await getUser()

    if (requireAuth && !user) {
        redirect(redirectTo)
    }

    if (!requireAuth && user) {
        redirect('/')
    }

    return <>{children}</>
}
