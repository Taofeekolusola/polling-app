import QRCode from 'qrcode'

export class QRService {
    /**
     * Generate QR code data URL for a poll
     */
    static async generateQRCode(pollUrl: string): Promise<string> {
        try {
            const qrDataUrl = await QRCode.toDataURL(pollUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            })
            return qrDataUrl
        } catch (error) {
            throw new Error('Failed to generate QR code')
        }
    }

    /**
     * Generate QR code for sharing a poll
     */
    static async generatePollQRCode(pollId: string, baseUrl: string): Promise<string> {
        const pollUrl = `${baseUrl}/(polls)/${pollId}`
        return this.generateQRCode(pollUrl)
    }

    /**
     * Generate QR code for direct voting
     */
    static async generateVoteQRCode(pollId: string, baseUrl: string): Promise<string> {
        const voteUrl = `${baseUrl}/(polls)/${pollId}/vote`
        return this.generateQRCode(voteUrl)
    }

    /**
     * Parse QR code content to extract poll information
     */
    static parsePollQRCode(qrContent: string): { pollId: string; type: 'view' | 'vote' } | null {
        try {
            const url = new URL(qrContent)
            const pathParts = url.pathname.split('/')

            // Extract poll ID from URL like /(polls)/123 or /(polls)/123/vote
            const pollIndex = pathParts.findIndex(part => part === '(polls)')
            if (pollIndex === -1) return null

            const pollId = pathParts[pollIndex + 1]
            const type = pathParts[pollIndex + 2] === 'vote' ? 'vote' : 'view'

            return { pollId, type }
        } catch {
            return null
        }
    }
}

