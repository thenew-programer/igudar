'use client';

import React from 'react';
import { SeedDataButton } from '@/components/ui/SeedDataButton';

export default function SeedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-igudar-text mb-2">
              Database Management
            </h1>
            <p className="text-igudar-text-secondary">
              Seed the database with sample Moroccan real estate properties for development and testing
            </p>
          </div>

          <SeedDataButton />

          <div className="mt-8 text-center text-sm text-igudar-text-muted">
            <p>
              This tool is only available in development mode. 
              It will populate your Supabase database with realistic sample data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}