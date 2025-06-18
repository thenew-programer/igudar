import { supabase, handleSupabaseError } from './supabase';
import { 
  Property, 
  PropertyInsert, 
  PropertyUpdate, 
  PropertyFilters,
  QueryOptions,
  DatabaseResponse 
} from '@/types/database';

// Property CRUD Operations
export class PropertyService {
  
  // Get all properties with optional filters and pagination
  static async getProperties(
    filters?: PropertyFilters,
    options?: QueryOptions
  ): Promise<DatabaseResponse<Property[]>> {
    try {
      let query = supabase
        .from('properties')
        .select('*');

      // Apply filters
      if (filters) {
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        if (filters.property_type) {
          query = query.eq('property_type', filters.property_type);
        }
        if (filters.city) {
          query = query.eq('city', filters.city);
        }
        if (filters.min_price) {
          query = query.gte('price', filters.min_price);
        }
        if (filters.max_price) {
          query = query.lte('price', filters.max_price);
        }
        if (filters.min_investment) {
          query = query.gte('min_investment', filters.min_investment);
        }
        if (filters.max_investment) {
          query = query.lte('min_investment', filters.max_investment);
        }
      }

      // Apply ordering and pagination
      if (options) {
        if (options.orderBy) {
          query = query.order(options.orderBy, { 
            ascending: options.ascending ?? true 
          });
        }
        if (options.limit) {
          query = query.limit(options.limit);
        }
        if (options.offset) {
          query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
        }
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Properties retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve properties'
      };
    }
  }

  // Get property by ID
  static async getPropertyById(id: string): Promise<DatabaseResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Property not found',
          message: 'Property with the specified ID does not exist'
        };
      }

      return {
        success: true,
        data,
        message: 'Property retrieved successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to retrieve property'
      };
    }
  }

  // Create new property
  static async createProperty(property: PropertyInsert): Promise<DatabaseResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        success: true,
        data,
        message: 'Property created successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to create property'
      };
    }
  }

  // Update property
  static async updateProperty(
    id: string, 
    updates: PropertyUpdate
  ): Promise<DatabaseResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: 'Property not found',
          message: 'Property with the specified ID does not exist'
        };
      }

      return {
        success: true,
        data,
        message: 'Property updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to update property'
      };
    }
  }

  // Delete property
  static async deleteProperty(id: string): Promise<DatabaseResponse<void>> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return {
        success: true,
        message: 'Property deleted successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Failed to delete property'
      };
    }
  }

  // Get properties by status
  static async getPropertiesByStatus(status: string): Promise<DatabaseResponse<Property[]>> {
    return this.getProperties({ status: status as any });
  }

  // Get active properties
  static async getActiveProperties(): Promise<DatabaseResponse<Property[]>> {
    return this.getProperties({ status: 'active' as any });
  }

  // Search properties by title or location
  static async searchProperties(searchTerm: string): Promise<DatabaseResponse<Property[]>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`title.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
        .eq('status', 'active');

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data || [],
        message: 'Search completed successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: handleSupabaseError(error),
        message: 'Search failed'
      };
    }
  }
}

// Database health check
export const checkDatabaseHealth = async (): Promise<DatabaseResponse<any>> => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('count')
      .limit(1);

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: { status: 'healthy', timestamp: new Date().toISOString() },
      message: 'Database connection is healthy'
    };

  } catch (error) {
    return {
      success: false,
      error: handleSupabaseError(error),
      message: 'Database connection failed'
    };
  }
};