'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export default function BillingPage() {
  // Mock billing data - in real app this would come from API
  const mockTransactions = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Investment in Luxury Apartment - Casablanca Marina',
      amount: 25000,
      status: 'completed',
      type: 'investment'
    },
    {
      id: '2',
      date: '2024-01-10',
      description: 'Platform Fee',
      amount: 150,
      status: 'completed',
      type: 'fee'
    },
    {
      id: '3',
      date: '2024-01-05',
      description: 'Investment in Traditional Riad - Marrakech',
      amount: 50000,
      status: 'completed',
      type: 'investment'
    },
    {
      id: '4',
      date: '2024-01-01',
      description: 'Dividend Payment - Office Building Rabat',
      amount: 1250,
      status: 'completed',
      type: 'dividend'
    }
  ];

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString()} MAD`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'investment':
        return 'text-igudar-primary';
      case 'dividend':
        return 'text-green-600';
      case 'fee':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'failed':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="p-6" key={user?.id || 'loading'}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-igudar-text">
              Billing & Payments
            </h1>
            <p className="text-lg text-igudar-text-secondary">
              Manage your payment methods, view transaction history, and download invoices
            </p>
          </div>
          <Button className="bg-igudar-primary hover:bg-igudar-primary/90 text-white">
            <Download className="mr-2 h-4 w-4" />
            Download Statement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-igudar-text-secondary">
                Total Invested
              </CardTitle>
              <DollarSign className="h-4 w-4 text-igudar-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-igudar-text">
                {formatCurrency(75000)}
              </div>
              <p className="text-xs text-igudar-text-muted">
                Across all properties
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-igudar-text-secondary">
                Total Fees Paid
              </CardTitle>
              <CreditCard className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-igudar-text">
                {formatCurrency(450)}
              </div>
              <p className="text-xs text-igudar-text-muted">
                Platform and transaction fees
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-igudar-text-secondary">
                Dividends Received
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-igudar-text">
                {formatCurrency(3750)}
              </div>
              <p className="text-xs text-igudar-text-muted">
                Total dividend payments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-igudar-text-secondary">
                Pending Transactions
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-igudar-text">0</div>
              <p className="text-xs text-igudar-text-muted">
                No pending transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-igudar-text">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">VISA</span>
                  </div>
                  <div>
                    <div className="font-medium text-igudar-text">•••• •••• •••• 4242</div>
                    <div className="text-sm text-igudar-text-muted">Expires 12/26</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Default
                  </Badge>
                </div>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
              
              <Button variant="outline" className="w-full border-dashed">
                <CreditCard className="mr-2 h-4 w-4" />
                Add New Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-igudar-text">
                <FileText className="mr-2 h-5 w-5" />
                Transaction History
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Filter by Date
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => {
                const StatusIcon = getStatusIcon(transaction.status);
                
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <StatusIcon className={`h-4 w-4 ${
                          transaction.status === 'completed' ? 'text-green-600' :
                          transaction.status === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <div className="font-medium text-igudar-text">
                          {transaction.description}
                        </div>
                        <div className="text-sm text-igudar-text-muted">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-semibold ${getTypeColor(transaction.type)}`}>
                        {transaction.type === 'dividend' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 text-center">
              <Button variant="outline">
                Load More Transactions
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-igudar-text">Billing Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-igudar-text mb-3">Billing Address</h4>
                <div className="space-y-2 text-sm text-igudar-text-secondary">
                  <div>John Doe</div>
                  <div>123 Avenue Mohammed V</div>
                  <div>Casablanca, 20000</div>
                  <div>Morocco</div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Address
                </Button>
              </div>
              
              <div>
                <h4 className="font-medium text-igudar-text mb-3">Tax Information</h4>
                <div className="space-y-2 text-sm text-igudar-text-secondary">
                  <div>Tax ID: MA123456789</div>
                  <div>VAT Number: Not applicable</div>
                  <div>Tax Status: Individual</div>
                </div>
                <Button variant="outline" size="sm" className="mt-3">
                  Update Tax Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}