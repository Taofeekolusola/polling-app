import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PollService } from '@/lib/polls/poll-service'
import { getClientIP } from '@/lib/utils/fingerprint'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pollId } = await params
        const { optionId, fingerprint } = await request.json()

        if (!optionId) {
            return NextResponse.json(
                { error: 'Option ID is required' },
                { status: 400 }
            )
        }

        const supabase = createClient()
        const pollService = new PollService()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        // Get client IP
        const clientIP = getClientIP(request.headers)

        // Attempt to vote
        const result = await pollService.vote(
            pollId,
            optionId,
            user?.id,
            clientIP,
            fingerprint
        )

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Vote error:', error)
        return NextResponse.json(
            { error: 'Failed to submit vote' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: pollId } = await params
        const supabase = createClient()
        const pollService = new PollService()

        // Get current user
        const { data: { user } } = await supabase.auth.getUser()

        // Get client IP
        const clientIP = getClientIP(request.headers)

        // Get fingerprint from query params
        const fingerprint = request.nextUrl.searchParams.get('fingerprint')

        // Get poll with user's vote status
        const poll = await pollService.getPollById(
            pollId,
            user?.id,
            clientIP,
            fingerprint || undefined
        )

        if (!poll) {
            return NextResponse.json(
                { error: 'Poll not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(poll)
    } catch (error: any) {
        console.error('Get poll error:', error)
        return NextResponse.json(
            { error: 'Failed to get poll' },
            { status: 500 }
        )
    }
}

