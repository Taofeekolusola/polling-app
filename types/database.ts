export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            polls: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    created_by: string
                    is_public: boolean
                    allow_multiple_votes: boolean
                    expires_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    created_by: string
                    is_public?: boolean
                    allow_multiple_votes?: boolean
                    expires_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    created_by?: string
                    is_public?: boolean
                    allow_multiple_votes?: boolean
                    expires_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            poll_options: {
                Row: {
                    id: string
                    poll_id: string
                    label: string
                    description: string | null
                    order_index: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    poll_id: string
                    label: string
                    description?: string | null
                    order_index?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    poll_id?: string
                    label?: string
                    description?: string | null
                    order_index?: number
                    created_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    poll_id: string
                    option_id: string
                    voter_id: string | null
                    voter_ip: string | null
                    voter_fingerprint: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    poll_id: string
                    option_id: string
                    voter_id?: string | null
                    voter_ip?: string | null
                    voter_fingerprint?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    poll_id?: string
                    option_id?: string
                    voter_id?: string | null
                    voter_ip?: string | null
                    voter_fingerprint?: string | null
                    created_at?: string
                }
            }
            qr_codes: {
                Row: {
                    id: string
                    poll_id: string
                    code: string
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    poll_id: string
                    code: string
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    poll_id?: string
                    code?: string
                    is_active?: boolean
                    created_at?: string
                }
            }
        }
    }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type PollOption = Database['public']['Tables']['poll_options']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']
export type QRCode = Database['public']['Tables']['qr_codes']['Row']

