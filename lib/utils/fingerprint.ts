/**
 * Generate a browser fingerprint for anonymous voting
 * This creates a unique identifier based on browser characteristics
 */
export function generateFingerprint(): string {
    if (typeof window === 'undefined') return ''

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // Create a unique fingerprint based on browser characteristics
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency,
        navigator.deviceMemory,
        navigator.platform,
        navigator.cookieEnabled,
        navigator.doNotTrack,
        navigator.maxTouchPoints,
        // Canvas fingerprint
        ctx.getImageData(0, 0, 1, 1).data.join(''),
        // WebGL fingerprint
        (() => {
            try {
                const canvas = document.createElement('canvas')
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
                if (!gl) return ''
                return gl.getParameter(gl.VENDOR) + gl.getParameter(gl.RENDERER)
            } catch {
                return ''
            }
        })()
    ].join('|')

    // Create a hash of the fingerprint
    return btoa(fingerprint).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32)
}

/**
 * Get client IP address from headers (for server-side use)
 */
export function getClientIP(headers: Headers): string | null {
    // Check various headers for IP address
    const ipHeaders = [
        'x-forwarded-for',
        'x-real-ip',
        'x-client-ip',
        'cf-connecting-ip', // Cloudflare
        'x-forwarded',
        'forwarded-for',
        'forwarded'
    ]

    for (const header of ipHeaders) {
        const value = headers.get(header)
        if (value) {
            // Extract the first IP from the list
            const ip = value.split(',')[0].trim()
            if (ip && ip !== 'unknown') {
                return ip
            }
        }
    }

    return null
}

/**
 * Create a unique voter identifier
 */
export function createVoterId(userId?: string, userIp?: string, fingerprint?: string): string {
    if (userId) return `user_${userId}`
    if (userIp) return `ip_${userIp}`
    if (fingerprint) return `fp_${fingerprint}`
    return `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

