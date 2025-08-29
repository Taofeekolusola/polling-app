import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Profile } from '@/types/database'

export async function getUser() {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    } catch (error) {
        return null
    }
}

export async function getUserProfile(): Promise<Profile | null> {
    const supabase = createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return null

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        return profile
    } catch (error) {
        return null
    }
}

export async function requireAuth() {
    const user = await getUser()
    if (!user) {
        redirect('/(auth)/signin')
    }
    return user
}

export async function createProfile(userId: string, email: string, fullName?: string) {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .insert({
            id: userId,
            email,
            full_name: fullName,
        })
        .select()
        .single()

    if (error) throw error
    return data
}

