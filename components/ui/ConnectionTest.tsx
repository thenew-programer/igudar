'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { testConnection } from '@/lib/supabase';
import { checkDatabaseHealth, PropertyService } from '@/lib/database';

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
  timestamp?: string;
  error?: string;
}

export function ConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const runConnectionTest = async () => {
    setIsLoading(true);
    setConnectionStatus(null);
    setHealthStatus(null);

    try {
      // Test basic connection
      const connectionResult = await testConnection();
      
      // Test database health
      const healthResult = await checkDatabaseHealth();
      
      // Test property service
      const propertiesResult = await PropertyService.getProperties({}, { limit: 1 });

      setConnectionStatus({
        isConnected: connectionResult.success,
        message: connectionResult.message,
        timestamp: new Date().toISOString(),
        error: connectionResult.success ? undefined : connectionResult.message
      });

      setHealthStatus({
        database: healthResult.success,
        properties: propertiesResult.success,
        details: {
          databaseMessage: healthResult.message,
          propertiesMessage: propertiesResult.message
        }
      });

    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        message: 'Connection test failed',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (isConnected: boolean) => {
    if (isConnected) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (isConnected: boolean) => {
    return (
      <Badge variant={isConnected ? "default" : "destructive"}>
        {isConnected ? "Connected" : "Disconnected"}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-6 w-6 text-igudar-primary" />
          Supabase Connection Test
        </CardTitle>
        <CardDescription>
          Test the connection to your Supabase database and verify the setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runConnectionTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Test Connection
            </>
          )}
        </Button>

        {connectionStatus && (
          <Alert className={connectionStatus.isConnected ? "border-green-200" : "border-red-200"}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(connectionStatus.isConnected)}
                <AlertDescription className="font-medium">
                  {connectionStatus.message}
                </AlertDescription>
              </div>
              {getStatusBadge(connectionStatus.isConnected)}
            </div>
            {connectionStatus.timestamp && (
              <p className="text-xs text-muted-foreground mt-2">
                Tested at: {new Date(connectionStatus.timestamp).toLocaleString()}
              </p>
            )}
            {connectionStatus.error && (
              <p className="text-xs text-red-600 mt-2">
                Error: {connectionStatus.error}
              </p>
            )}
          </Alert>
        )}

        {healthStatus && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Service Status:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Database</span>
                {getStatusIcon(healthStatus.database)}
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">Properties</span>
                {getStatusIcon(healthStatus.properties)}
              </div>
            </div>
            {healthStatus.details && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Database: {healthStatus.details.databaseMessage}</p>
                <p>Properties: {healthStatus.details.propertiesMessage}</p>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Environment Variables Required:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>NEXT_PUBLIC_SUPABASE_URL</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="mt-2">
            Make sure to copy .env.local.example to .env.local and fill in your Supabase credentials.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}