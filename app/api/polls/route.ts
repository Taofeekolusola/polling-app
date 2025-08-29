import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PollService } from '@/lib/polls/poll-service'
import { requireAuth } from '@/lib/auth/auth-helpers'

export async function POST(request: NextRequest) {
    try {
        // Ensure user is authenticated
        const user = await requireAuth()
        
        const { title, description, options, is_public, allow_multiple_votes, expires_at } = await request.json()

        // Validate required fields
        if (!title || !options || options.length < 2) {
            return NextResponse.json(
                { error: 'Title and at least 2 options are required' },
                { status: 400 }
            )
        }

        const pollService = new PollService()

        // Create poll with QR codes
        const result = await pollService.createPoll({
            title,
            description,
            options,
            is_public,
            allow_multiple_votes,
            expires_at
        }, user.id)

        return NextResponse.json({
            success: true,
            poll: result.poll,
            qrCodes: result.qrCodes
        })
    } catch (error: any) {
        console.error('Create poll error:', error)
        return NextResponse.json(
            { error: 'Failed to create poll' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const pollService = new PollService()
        const polls = await pollService.getPolls()

        return NextResponse.json(polls)
    } catch (error: any) {
        console.error('Get polls error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch polls' },
            { status: 500 }
        )
    }
}

