import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Sync will be disabled.')
}

/**
 * Supabase client singleton
 */
export const supabase = supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    })
    : null

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = () => !!supabase

/**
 * Auth helpers
 */
export const auth = {
    /**
     * Sign up with email (Magic Link)
     */
    async signInWithEmail(email) {
        if (!supabase) throw new Error('Supabase not configured')

        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        })

        if (error) throw error
        return data
    },

    /**
     * Sign out
     */
    async signOut() {
        if (!supabase) throw new Error('Supabase not configured')

        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    /**
     * Get current session
     */
    async getSession() {
        if (!supabase) return null

        const { data: { session } } = await supabase.auth.getSession()
        return session
    },

    /**
     * Get current user
     */
    async getUser() {
        if (!supabase) return null

        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange(callback) {
        if (!supabase) return { data: { subscription: { unsubscribe: () => { } } } }

        return supabase.auth.onAuthStateChange(callback)
    },
}

export default supabase
