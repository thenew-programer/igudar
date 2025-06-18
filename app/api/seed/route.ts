import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/supabase';
import { seedProperties } from '@/lib/seed-data';
import { PropertyStatus, PropertyType } from '@/types/property';

// Convert seed data to database format (MAD to cents)
const convertToDbFormat = (property: any) => {
  return {
    ...property,
    price: property.price * 100, // Convert MAD to cents
    min_investment: property.min_investment * 100,
    target_amount: property.target_amount * 100,
    total_raised: property.total_raised * 100,
    monthly_rent: property.monthly_rent ? property.monthly_rent * 100 : null,
    maintenance_cost: property.maintenance_cost ? property.maintenance_cost * 100 : null,
    property_tax: property.property_tax ? property.property_tax * 100 : null,
    price_per_share: property.price_per_share * 100,
  };
};

export async function POST(request: NextRequest) {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin operations not available - missing service role key',
          message: 'Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables'
        },
        { status: 500 }
      );
    }

    // Check if we're in development mode for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Seeding is only allowed in development mode' 
        },
        { status: 403 }
      );
    }

    console.log('Starting database seeding...');

    // Check if properties already exist using admin client
    const { data: existingProperties, error: checkError } = await supabaseAdmin
      .from('properties')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing properties:', checkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to check existing properties',
          details: checkError.message 
        },
        { status: 500 }
      );
    }

    // If properties already exist, ask for confirmation
    const { force } = await request.json().catch(() => ({ force: false }));
    
    if (existingProperties && existingProperties.length > 0 && !force) {
      return NextResponse.json({
        success: false,
        error: 'Properties already exist in database',
        message: 'Database already contains properties. Use force=true to proceed anyway.',
        existingCount: existingProperties.length
      }, { status: 409 });
    }

    // Convert seed data to database format
    const dbProperties = seedProperties.map(convertToDbFormat);

    console.log(`Inserting ${dbProperties.length} properties...`);

    // Insert properties in batches to avoid timeout using admin client
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < dbProperties.length; i += batchSize) {
      const batch = dbProperties.slice(i, i + batchSize);
      
      console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(dbProperties.length / batchSize)}...`);
      
      const { data, error } = await supabaseAdmin
        .from('properties')
        .insert(batch)
        .select('id, title, city, status');

      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        return NextResponse.json(
          { 
            success: false, 
            error: `Failed to insert batch ${Math.floor(i / batchSize) + 1}`,
            details: error.message,
            insertedSoFar: results.length
          },
          { status: 500 }
        );
      }

      results.push(...(data || []));
    }

    // Get statistics about inserted data
    const stats = {
      totalInserted: results.length,
      cityCounts: results.reduce((acc: Record<string, number>, prop: any) => {
        acc[prop.city] = (acc[prop.city] || 0) + 1;
        return acc;
      }, {}),
      statusCounts: results.reduce((acc: Record<string, number>, prop: any) => {
        acc[prop.status] = (acc[prop.status] || 0) + 1;
        return acc;
      }, {}),
    };

    console.log('Database seeding completed successfully!');
    console.log('Statistics:', stats);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        insertedProperties: results.length,
        properties: results,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Unexpected error during seeding:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error during seeding',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current database statistics using regular client (read operations)
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, title, city, status, property_type, created_at');

    if (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch properties',
          details: error.message 
        },
        { status: 500 }
      );
    }

    const stats = {
      totalProperties: properties?.length || 0,
      cityCounts: properties?.reduce((acc: Record<string, number>, prop: any) => {
        acc[prop.city] = (acc[prop.city] || 0) + 1;
        return acc;
      }, {}) || {},
      statusCounts: properties?.reduce((acc: Record<string, number>, prop: any) => {
        acc[prop.status] = (acc[prop.status] || 0) + 1;
        return acc;
      }, {}) || {},
      typeCounts: properties?.reduce((acc: Record<string, number>, prop: any) => {
        acc[prop.property_type] = (acc[prop.property_type] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    return NextResponse.json({
      success: true,
      message: 'Database statistics retrieved',
      data: {
        statistics: stats,
        seedDataAvailable: seedProperties.length,
        canSeed: !!supabaseAdmin,
        adminClientAvailable: !!supabaseAdmin
      }
    });

  } catch (error) {
    console.error('Error fetching database statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch database statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Admin operations not available - missing service role key',
          message: 'Please ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables'
        },
        { status: 500 }
      );
    }

    // Check if we're in development mode for safety
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database clearing is only allowed in development mode' 
        },
        { status: 403 }
      );
    }

    console.log('Clearing all properties from database...');

    // Delete all properties using admin client (this will cascade to related records)
    const { error } = await supabaseAdmin
      .from('properties')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) {
      console.error('Error clearing properties:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to clear properties',
          details: error.message 
        },
        { status: 500 }
      );
    }

    console.log('Database cleared successfully!');

    return NextResponse.json({
      success: true,
      message: 'All properties cleared from database'
    });

  } catch (error) {
    console.error('Unexpected error during clearing:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error during clearing',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}