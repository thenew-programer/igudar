import { NextResponse } from 'next/server';
import { supabase, supabaseAdmin, testConnection, testAdminConnection } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connections...');

    // Test regular connection
    const regularTest = await testConnection();
    
    // Test admin connection
    const adminTest = await testAdminConnection();

    // Test table structure with regular client
    const { data: tableInfo, error: tableError } = await supabase
      .from('properties')
      .select('id, title, status')
      .limit(1);

    if (tableError) {
      console.error('Table structure error:', tableError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Properties table not accessible',
          details: tableError.message 
        },
        { status: 500 }
      );
    }

    console.log('Supabase connection tests completed!');

    return NextResponse.json({
      success: true,
      message: 'Supabase connection tests completed',
      data: {
        regularConnection: regularTest,
        adminConnection: adminTest,
        tableAccessible: true,
        adminClientAvailable: !!supabaseAdmin,
        environmentCheck: {
          supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          serviceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          nodeEnv: process.env.NODE_ENV
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Unexpected error during connection test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Unexpected error during connection test',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}