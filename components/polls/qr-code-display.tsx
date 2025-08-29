'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Share2, Copy, Eye, Vote } from 'lucide-react'
import { toast } from 'sonner'

interface QRCodeDisplayProps {
    pollId: string
    pollTitle: string
    qrCodes: {
        view: string
        vote: string
    }
}

interface QRCodeData {
    qrCode: string
    pollUrl: string
}

export function QRCodeDisplay({ pollId, pollTitle, qrCodes }: QRCodeDisplayProps) {
    const [viewQR, setViewQR] = useState<QRCodeData | null>(null)
    const [voteQR, setVoteQR] = useState<QRCodeData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadQRCodes = async () => {
            try {
                // Load view QR code
                const viewResponse = await fetch(`/api/qr/${qrCodes.view}`)
                const viewData = await viewResponse.json()
                if (viewData.success) {
                    setViewQR(viewData)
                }

                // Load vote QR code
                const voteResponse = await fetch(`/api/qr/${qrCodes.vote}`)
                const voteData = await voteResponse.json()
                if (voteData.success) {
                    setVoteQR(voteData)
                }
            } catch (error) {
                console.error('Failed to load QR codes:', error)
            } finally {
                setLoading(false)
            }
        }

        loadQRCodes()
    }, [qrCodes])

    const downloadQRCode = async (qrDataUrl: string, filename: string) => {
        try {
            const link = document.createElement('a')
            link.href = qrDataUrl
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            toast.success('QR code downloaded successfully')
        } catch (error) {
            toast.error('Failed to download QR code')
        }
    }

    const copyPollUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url)
            toast.success('Poll URL copied to clipboard')
        } catch (error) {
            toast.error('Failed to copy URL')
        }
    }

    const sharePoll = async (url: string, title: string) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Vote on: ${title}`,
                    text: `Check out this poll: ${title}`,
                    url: url
                })
            } catch (error) {
                // User cancelled sharing
            }
        } else {
            // Fallback to copying URL
            await copyPollUrl(url)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Share Your Poll
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="view" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="view" className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Poll
                        </TabsTrigger>
                        <TabsTrigger value="vote" className="flex items-center gap-2">
                            <Vote className="h-4 w-4" />
                            Direct Vote
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="view" className="space-y-4">
                        {viewQR && (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <img 
                                        src={viewQR.qrCode} 
                                        alt="View Poll QR Code"
                                        className="border rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Scan to view the poll
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadQRCode(viewQR.qrCode, `${pollTitle}-view-qr.png`)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyPollUrl(viewQR.pollUrl)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy URL
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => sharePoll(viewQR.pollUrl, pollTitle)}
                                        >
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="vote" className="space-y-4">
                        {voteQR && (
                            <div className="text-center space-y-4">
                                <div className="flex justify-center">
                                    <img 
                                        src={voteQR.qrCode} 
                                        alt="Vote QR Code"
                                        className="border rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">
                                        Scan to vote directly
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadQRCode(voteQR.qrCode, `${pollTitle}-vote-qr.png`)}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Download
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyPollUrl(voteQR.pollUrl)}
                                        >
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy URL
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => sharePoll(voteQR.pollUrl, pollTitle)}
                                        >
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Share
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

