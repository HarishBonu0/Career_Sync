// Supabase Client Configuration for Landing Page
// Use CDN-friendly ESM import so it works in the browser without bundling
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export async function signUp(email, password, username = null) {
    try {
        console.log('[signUp] Starting signup process for:', email);
        
        // Step 1: Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            console.error('[signUp] Auth error:', authError);
            throw authError;
        }

        console.log('[signUp] Auth user created, user ID:', authData.user?.id);

        // Step 2: Create user record in users table using UPSERT
        if (authData.user) {
            const userData = {
                id: authData.user.id,
                email: email,
                username: username || email.split('@')[0],
                created_at: new Date().toISOString(),
                last_login: new Date().toISOString(),
                is_active: true
            };

            console.log('[signUp] Attempting to upsert user record:', userData);

            const { data: upsertData, error: userError } = await supabase
                .from('users')
                .upsert([userData], { onConflict: 'id' })
                .select()
                .single();

            if (userError) {
                console.error('[signUp] Upsert error:', userError);
                console.error('[signUp] Error details:', {
                    message: userError.message,
                    code: userError.code,
                    details: userError.details
                });
                throw userError;
            }

            console.log('[signUp] User record saved successfully:', upsertData);
            return { success: true, user: authData.user, userData: upsertData };
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('[signUp] Signup error:', error);
        return { success: false, error: error.message };
    }
}

export async function signIn(email, password) {
    try {
        console.log('[signIn] Starting sign in for:', email);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('[signIn] Auth error:', error);
            throw error;
        }

        console.log('[signIn] User authenticated, user ID:', data.user?.id);

        // Record login details in the users table
        let loginProfile = null;
        if (data.user) {
            loginProfile = await logLogin(data.user);
        }

        // Fetch user data from users table
        if (data.user) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (userError) {
                console.error('[signIn] Error fetching user data:', userError);
            }

            console.log('[signIn] Sign in successful');
            return { success: true, user: data.user, session: data.session, userData: userData || loginProfile };
        }

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('[signIn] Sign in error:', error);
        return { success: false, error: error.message };
    }
}

// Upsert login info for a user
async function logLogin(user) {
    try {
        console.log('[logLogin] Recording login for user:', user.id);
        const now = new Date().toISOString();
        const profile = {
            id: user.id,
            email: user.email,
            last_login: now,
        };

        const { data, error } = await supabase
            .from('users')
            .upsert(profile, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('[logLogin] Error upserting login:', error);
            throw error;
        }
        console.log('[logLogin] Login recorded successfully');
        return data;
    } catch (err) {
        console.error('[logLogin] Error:', err);
        return null;
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Sign out error:', error);
        return { success: false, error: error.message };
    }
}

export async function getCurrentUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // If no user or auth session missing, just return null (not an error)
        if (!user || error) {
            if (error?.message?.includes('session')) {
                console.log('[getCurrentUser] No active session - user not logged in');
                return { user: null, userData: null };
            }
            if (error) {
                console.error('[getCurrentUser] Auth error:', error);
                return { user: null, userData: null };
            }
        }

        if (user) {
            // Fetch additional user data from users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('[getCurrentUser] Error fetching user data:', userError);
            }

            console.log('[getCurrentUser] User found:', user.email);
            return { user, userData };
        }

        return { user: null, userData: null };
    } catch (error) {
        console.error('[getCurrentUser] Unexpected error:', error);
        return { user: null, userData: null };
    }
}

export async function resetPassword(email) {
    try {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth.html?reset=true`,
        });

        if (error) throw error;
        return { success: true };
    } catch (error) {
        console.error('Reset password error:', error);
        return { success: false, error: error.message };
    }
}

export async function updatePassword(newPassword) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return { success: true, user: data.user };
    } catch (error) {
        console.error('Update password error:', error);
        return { success: false, error: error.message };
    }
}
