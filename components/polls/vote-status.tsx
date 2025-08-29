import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'

interface VoteStatusProps {
    hasVoted: boolean
    userVote?: {
        option_id: string
        option_label: string
        voted_at: string
    }
}

export function VoteStatus({ hasVoted, userVote }: VoteStatusProps) {
    if (!hasVoted) {
        return null
    }

    return (
        <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                        <p className="font-medium text-green-800">
                            You have already voted
                        </p>
                        {userVote && (
                            <p className="text-sm text-green-600">
                                Your vote: <span className="font-medium">{userVote.option_label}</span>
                            </p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

interface DuplicateVoteErrorProps {
    error: string
    onDismiss: () => void
}

export function DuplicateVoteError({ error, onDismiss }: DuplicateVoteErrorProps) {
    return (
        <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <p className="font-medium text-red-800">{error}</p>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Dismiss
                    </button>
                </div>
            </CardContent>
        </Card>
    )
}

