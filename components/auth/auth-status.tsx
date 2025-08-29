'use client'

import { useUserProfile } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth/auth-provider'

export function AuthStatus() {
    const { signOut } = useAuth()
    const { fullName, email, isVerified } = useUserProfile()

    const handleSignOut = async () => {
        await signOut()
    }

    return (
        <div className="flex items-center gap-4">
            <div className="text-sm">
                <p className="font-medium">{fullName || 'User'}</p>
                <p className="text-muted-foreground">{email}</p>
                {!isVerified && (
                    <p className="text-xs text-orange-600">Email not verified</p>
                )}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
            </Button>
        </div>
    )
}

