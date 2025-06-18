import { supabase, handleSupabaseError } from './supabase';
import { User } from '@supabase/supabase-js';
import { User as DatabaseUser } from '@/types/database';

export interface AuthResponse {
  success: boolean;
  user?: User;
  userProfile?: DatabaseUser;
  error?: string;
  message?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

// Helper function to create or get user profile
export const ensureUserProfile = async (authUser: User): Promise<DatabaseUser | null> => {
  try {
    // First, check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (existingProfile && !fetchError) {
      return existingProfile;
    }

    // If profile doesn't exist, create it
    const newProfile = {
      id: authUser.id,
      email: authUser.email || '',
      full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
      subscription_tier: 'free' as const,
    };

    const { data: createdProfile, error: createError } = await supabase
      .from('users')
      .insert([newProfile])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user profile:', createError);
      return null;
    }

    return createdProfile;
  } catch (error) {
    console.error('Error ensuring user profile:', error);
    return null;
  }
};

// Sign up new user
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        }
      }
    });

    if (error) {
      throw error;
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Failed to create user account',
        message: 'Registration failed. Please try again.'
      };
    }

    // Create user profile in users table
    let userProfile: DatabaseUser | null = null;
    if (authData.user) {
      userProfile = await ensureUserProfile(authData.user);
    }

    return {
      success: true,
      user: authData.user,
      userProfile,
      message: 'Account created successfully! Please check your email to verify your account.'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Registration failed. Please try again.'
    };
  }
};

// Sign in existing user
export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw error;
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Invalid credentials',
        message: 'Login failed. Please check your email and password.'
      };
    }

    // Ensure user profile exists
    const userProfile = await ensureUserProfile(authData.user);

    return {
      success: true,
      user: authData.user,
      userProfile,
      message: 'Welcome back!'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Login failed. Please check your credentials and try again.'
    };
  }
};

// Sign out user
export const signOut = async (): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Signed out successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Sign out failed. Please try again.'
    };
  }
};

// Get current user
export const getUser = async (): Promise<AuthResponse> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw error;
    }

    let userProfile: DatabaseUser | null = null;
    if (user) {
      userProfile = await ensureUserProfile(user);
    }

    return {
      success: true,
      user: user || undefined,
      userProfile,
      message: user ? 'User retrieved successfully' : 'No user found'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to get user information'
    };
  }
};

// Get user session
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return {
      success: true,
      session,
      user: session?.user || null
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      session: null,
      user: null
    };
  }
};

// Reset password
export const resetPassword = async (email: string): Promise<AuthResponse> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to send password reset email. Please try again.'
    };
  }
};

// Update password
export const updatePassword = async (newPassword: string): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      user: data.user,
      message: 'Password updated successfully'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Failed to update password. Please try again.'
    };
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { session } = await getSession();
  return !!session;
};