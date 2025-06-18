import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

export const supabase = createClientComponentClient<Database>();

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
