import { useState } from 'react'
import { generateFingerprint } from '@/lib/utils/fingerprint'

interface VoteResult {
    success: boolean
    error?: string
}

export function useVote(pollId: string) {
    const [isVoting, setIsVoting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const vote = async (optionId: string): Promise<VoteResult> => {
        setIsVoting(true)
        setError(null)

        try {
            // Generate fingerprint for anonymous voting
            const fingerprint = generateFingerprint()

            const response = await fetch(`/api/polls/${pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    optionId,
                    fingerprint
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to submit vote')
                return { success: false, error: data.error }
            }

            return { success: true }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to submit vote'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsVoting(false)
        }
    }

    const resetError = () => {
        setError(null)
    }

    return {
        vote,
        isVoting,
        error,
        resetError
    }
}

