'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Trash2,
  BarChart3
} from 'lucide-react';

interface SeedStats {
  totalInserted?: number;
  cityCounts?: Record<string, number>;
  statusCounts?: Record<string, number>;
  typeCounts?: Record<string, number>;
  totalProperties?: number;
  seedDataAvailable?: number;
  canSeed?: boolean;
}

interface SeedResponse {
  success: boolean;
  message: string;
  error?: string;
  details?: string;
  data?: {
    insertedProperties?: number;
    properties?: any[];
    statistics?: SeedStats;
  };
  existingCount?: number;
}

export const SeedDataButton: React.FC = () => {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SeedResponse | null>(null);
  const [stats, setStats] = useState<SeedStats | null>(null);

  // Load initial stats
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/seed', {
        method: 'GET',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.statistics);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeed = async (force = false) => {
    setIsSeeding(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ force }),
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        await loadStats(); // Reload stats after successful seeding
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all properties from the database? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/seed', {
        method: 'DELETE',
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        await loadStats(); // Reload stats after successful clearing
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleForceConfirm = () => {
    if (confirm('Properties already exist in the database. Do you want to add more properties anyway?')) {
      handleSeed(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-igudar-primary" />
            <span>Database Connection</span>
          </CardTitle>
          <CardDescription>
            Test your Supabase connection and view current database status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-igudar-primary" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <span className="text-sm">
                {isLoading ? 'Checking connection...' : 'Connection active'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-igudar-primary" />
              <span>Database Statistics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-igudar-primary">
                  {stats.totalProperties || 0}
                </div>
                <div className="text-sm text-igudar-text-muted">Total Properties</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-igudar-primary">
                  {Object.keys(stats.cityCounts || {}).length}
                </div>
                <div className="text-sm text-igudar-text-muted">Cities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-igudar-primary">
                  {Object.keys(stats.typeCounts || {}).length}
                </div>
                <div className="text-sm text-igudar-text-muted">Property Types</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-igudar-primary">
                  {stats.seedDataAvailable || 0}
                </div>
                <div className="text-sm text-igudar-text-muted">Seed Available</div>
              </div>
            </div>

            {stats.cityCounts && Object.keys(stats.cityCounts).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-igudar-text">Properties by City:</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.cityCounts).map(([city, count]) => (
                    <Badge key={city} variant="outline">
                      {city}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Seed Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Seed Database</CardTitle>
          <CardDescription>
            Add sample Moroccan real estate properties to your database for development and testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleSeed(false)}
              disabled={isSeeding || isClearing || stats?.canSeed}
              className="bg-igudar-primary hover:bg-igudar-primary-dark text-white"
            >
              {isSeeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding Database...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Seed Database
                </>
              )}
            </Button>

            {stats && stats.totalProperties > 0 && (
              <Button
                onClick={handleClear}
                disabled={isSeeding || isClearing || stats?.canSeed}
                variant="destructive"
              >
                {isClearing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Database
                  </>
                )}
              </Button>
            )}
          </div>

          {stats?.canSeed && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Database seeding is only available in development mode for security reasons.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span>
                {result.success ? 'Success' : 'Error'}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant={result.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{result.message}</p>
                  
                  {result.error && (
                    <p className="text-sm opacity-80">
                      Error: {result.error}
                    </p>
                  )}
                  
                  {result.details && (
                    <p className="text-sm opacity-80">
                      Details: {result.details}
                    </p>
                  )}
                  
                  {result.existingCount && (
                    <div className="mt-3">
                      <p className="text-sm">
                        Found {result.existingCount} existing properties.
                      </p>
                      <Button
                        onClick={handleForceConfirm}
                        size="sm"
                        variant="outline"
                        className="mt-2"
                      >
                        Add Anyway
                      </Button>
                    </div>
                  )}
                  
                  {result.success && result.data?.insertedProperties && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">
                        Successfully inserted {result.data.insertedProperties} properties!
                      </p>
                      
                      {result.data.statistics && (
                        <div className="mt-2 space-y-1">
                          {result.data.statistics.cityCounts && (
                            <div className="text-sm">
                              <span className="font-medium">Cities: </span>
                              {Object.entries(result.data.statistics.cityCounts).map(([city, count], index) => (
                                <span key={city}>
                                  {index > 0 && ', '}
                                  {city} ({count})
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};