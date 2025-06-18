import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Regular Supabase client for client-side operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin Supabase client for server-side operations that bypass RLS
export const supabaseAdmin = (() => {
  if (!supabaseServiceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found. Admin operations will not be available.');
    return null;
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
})();

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  return 'An unexpected error occurred';
};

// Connection test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: handleSupabaseError(error) 
    };
  }
};

// Admin connection test function
export const testAdminConnection = async () => {
  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: 'Admin client not available - missing service role key' 
    };
  }
  
  try {
    const { data, error } = await supabaseAdmin
      .from('properties')
      .select('count')
      .limit(1);
    
    if (error) {
      throw error;
    }
    
    return { success: true, message: 'Admin connection successful' };
  } catch (error) {
    return { 
      success: false, 
      message: handleSupabaseError(error) 
    };
  }
};