import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
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

// Helper function to revalidate paths after database updates
export const revalidateAppPaths = () => {
	try {
		revalidatePath('/dashboard');
		revalidatePath('/properties');
		revalidatePath('/investments');
		revalidatePath('/portfolio');
		revalidatePath('/profile');
		revalidatePath('/billing');
		revalidatePath('/help');
		revalidatePath('/settings');
		revalidatePath('/security');
	} catch (error) {
		console.error('Error revalidating paths:', error);
	}
};