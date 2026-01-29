// Supabase Client Configuration for Landing Page
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynyjhfldcjwsgfmhrbqy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlueWpoZmxkY2p3c2dmbWhyYnF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyNTcyODMsImV4cCI6MjA4MjgzMzI4M30.8BUyRvhyg636yeUcOXK6RpZIlden7oRMB7vjJj-WNkM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export async function signUp(email, password, username = null) {
    try {
        // Step 1: Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) throw authError;

        // Step 2: Create user record in users table
        if (authData.user) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert([
                    {
                        id: authData.user.id,
                        email: email,
                        username: username || email.split('@')[0],
                        password_hash: 'hashed', // Supabase handles actual hashing
                        created_at: new Date().toISOString(),
                        is_active: true
                    }
                ])
                .select()
                .single();

            if (userError) {
                console.error('Error creating user record:', userError);
                // Don't throw, auth user is created
            }

            return { success: true, user: authData.user, userData };
        }

        return { success: true, user: authData.user };
    } catch (error) {
        console.error('Sign up error:', error);
        return { success: false, error: error.message };
    }
}

export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Fetch user data from users table
        if (data.user) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
            }

            return { success: true, user: data.user, session: data.session, userData };
        }

        return { success: true, user: data.user, session: data.session };
    } catch (error) {
        console.error('Sign in error:', error);
        return { success: false, error: error.message };
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
        
        if (error) throw error;

        if (user) {
            // Fetch additional user data from users table
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();

            if (userError) {
                console.error('Error fetching user data:', userError);
            }

            return { user, userData };
        }

        return { user: null, userData: null };
    } catch (error) {
        console.error('Get current user error:', error);
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
