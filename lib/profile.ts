import { supabase, handleSupabaseError } from './supabase';
import { revalidatePath } from 'next/cache';
import { User as DatabaseUser } from '@/types/database';
import { DatabaseResponse } from '@/types/database';

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  email?: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface BillingAddress {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postal_code: string;
  country: string;
}

export interface PaymentMethod {
  id: string;
  card_brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  is_default: boolean;
}

export class ProfileService {
  // Update user profile
  static async updateProfile(
    userId: string,
    data: ProfileUpdateData
  ): Promise<DatabaseResponse<DatabaseUser>> {
    try {
      // Validate data
      if (Object.keys(data).length === 0) {
        return {
          success: false,
          error: 'No update data provided',
          message: 'Please provide at least one field to update'
        };
      }

      // Update profile in database
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If email is being updated, update auth email as well
      if (data.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email: data.email
        });

        if (authError) {
          throw authError;
        }
      }

      // Revalidate relevant paths
      try {
        revalidatePath('/profile');
        revalidatePath('/dashboard');
      } catch (revalidateError) {
        console.error('Error revalidating paths:', revalidateError);
      }

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to update profile'
      };
    }
  }

  // Update user password
  static async updatePassword(
    userId: string,
    data: PasswordUpdateData
  ): Promise<DatabaseResponse<void>> {
    try {
      // First verify the current password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: (await supabase.auth.getUser()).data.user?.email || '',
        password: data.currentPassword
      });

      if (signInError) {
        return {
          success: false,
          error: 'Current password is incorrect',
          message: 'The current password you entered is incorrect. Please try again.'
        };
      }

      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to update password'
      };
    }
  }

  // Get user payment methods
  static async getPaymentMethods(userId: string): Promise<DatabaseResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Payment methods retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve payment methods'
      };
    }
  }

  // Add payment method
  static async addPaymentMethod(
    userId: string,
    paymentMethod: Omit<PaymentMethod, 'id' | 'is_default'> & { set_as_default?: boolean }
  ): Promise<DatabaseResponse<PaymentMethod>> {
    try {
      // Check if this should be the default card
      const { data: existingCards } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('user_id', userId);

      const isDefault = paymentMethod.set_as_default || (existingCards?.length === 0);
      
      // Insert the new payment method
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: userId,
          card_brand: paymentMethod.card_brand,
          last4: paymentMethod.last4,
          exp_month: paymentMethod.exp_month,
          exp_year: paymentMethod.exp_year,
          is_default: isDefault
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // If setting as default, update other cards
      if (isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId)
          .neq('id', data.id);
      }

      return {
        success: true,
        data,
        message: 'Payment method added successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to add payment method'
      };
    }
  }

  // Set default payment method
  static async setDefaultPaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<DatabaseResponse<void>> {
    try {
      // First, set all payment methods to non-default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      // Then set the selected one as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Default payment method updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to update default payment method'
      };
    }
  }

  // Remove payment method
  static async removePaymentMethod(
    userId: string,
    paymentMethodId: string
  ): Promise<DatabaseResponse<void>> {
    try {
      // Check if this is the default payment method
      const { data: paymentMethod, error: fetchError } = await supabase
        .from('payment_methods')
        .select('is_default')
        .eq('id', paymentMethodId)
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Delete the payment method
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentMethodId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // If this was the default, set a new default if any cards remain
      if (paymentMethod?.is_default) {
        const { data: remainingCards, error: cardsError } = await supabase
          .from('payment_methods')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (cardsError) {
          throw cardsError;
        }

        if (remainingCards && remainingCards.length > 0) {
          await supabase
            .from('payment_methods')
            .update({ is_default: true })
            .eq('id', remainingCards[0].id)
            .eq('user_id', userId);
        }
      }

      return {
        success: true,
        message: 'Payment method removed successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to remove payment method'
      };
    }
  }

  // Get user billing address
  static async getBillingAddress(userId: string): Promise<DatabaseResponse<BillingAddress>> {
    try {
      const { data, error } = await supabase
        .from('billing_addresses')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
        throw error;
      }

      return {
        success: true,
        data: data || null,
        message: data ? 'Billing address retrieved successfully' : 'No billing address found'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve billing address'
      };
    }
  }

  // Update or create billing address
  static async updateBillingAddress(
    userId: string,
    address: BillingAddress
  ): Promise<DatabaseResponse<BillingAddress>> {
    try {
      // Check if address already exists
      const { data: existingAddress } = await supabase
        .from('billing_addresses')
        .select('id')
        .eq('user_id', userId)
        .single();

      let result;
      
      if (existingAddress) {
        // Update existing address
        result = await supabase
          .from('billing_addresses')
          .update(address)
          .eq('user_id', userId)
          .select()
          .single();
      } else {
        // Create new address
        result = await supabase
          .from('billing_addresses')
          .insert([{ ...address, user_id: userId }])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      return {
        success: true,
        data: result.data,
        message: 'Billing address updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to update billing address'
      };
    }
  }
}