import { NextRequest, NextResponse } from 'next/server'
import { QRService } from '@/lib/qr/qr-service'
import { PollService } from '@/lib/polls/poll-service'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params
        const pollService = new PollService()

        // Get poll by QR code
        const poll = await pollService.getPollByQRCode(code)
        if (!poll) {
            return NextResponse.json(
                { error: 'Invalid QR code' },
                { status: 404 }
            )
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        
        // Determine if this is a view or vote QR code
        const isVoteCode = code.includes('poll_vote_')
        const pollUrl = isVoteCode 
            ? `${baseUrl}/(polls)/${poll.id}/vote`
            : `${baseUrl}/(polls)/${poll.id}`

        // Generate QR code image
        const qrDataUrl = await QRService.generateQRCode(pollUrl)

        // Return the QR code as a data URL
        return NextResponse.json({
            success: true,
            qrCode: qrDataUrl,
            pollUrl,
            poll: {
                id: poll.id,
                title: poll.title,
                description: poll.description
            }
        })
    } catch (error: any) {
        console.error('QR generation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate QR code' },
            { status: 500 }
        )
    }
}

