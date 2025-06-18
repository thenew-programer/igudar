'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { InvestmentService } from '@/lib/investments';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Loader2,
  X
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface InvestmentModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const InvestmentModal: React.FC<InvestmentModalProps> = ({
  property,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'calculate' | 'confirm' | 'payment'>('calculate');

  if (!property) return null;

  const formatPrice = (price: number): string => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M MAD`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K MAD`;
    }
    return `${Math.round(price).toLocaleString()} MAD`;
  };

  const minInvestmentMAD = Math.max(property.min_investment / 100, 1000);
  const pricePerShareMAD = property.price_per_share / 100;

  // Calculate investment details
  const calculateInvestment = () => {
    const amount = parseFloat(investmentAmount) || 0;
    if (amount <= 0) return null;

    const sharesPurchased = Math.floor(amount / pricePerShareMAD);
    const actualAmount = sharesPurchased * pricePerShareMAD;
    const expectedAnnualReturn = (actualAmount * property.expected_roi) / 100;
    const expectedMonthlyReturn = expectedAnnualReturn / 12;

    return {
      sharesPurchased,
      actualAmount,
      expectedAnnualReturn,
      expectedMonthlyReturn
    };
  };

  const calculation = calculateInvestment();

  const handleAmountChange = (value: string) => {
    const sanitizedValue = value.replace(/[^0-9.]/g, '');
    setInvestmentAmount(sanitizedValue);
    setError(null);
  };

  const validateInvestment = (): boolean => {
    if (!calculation) {
      setError('Please enter a valid investment amount');
      return false;
    }

    if (calculation.actualAmount < minInvestmentMAD) {
      setError(`Minimum investment is ${formatPrice(minInvestmentMAD)}`);
      return false;
    }

    if (calculation.sharesPurchased > property.shares_available) {
      setError(`Only ${property.shares_available} shares available`);
      return false;
    }

    return true;
  };

  const handleProceedToConfirm = () => {
    if (validateInvestment()) {
      setStep('confirm');
    }
  };

  const handleConfirmInvestment = async () => {
    if (!user?.id || !calculation) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Create investment record
      const result = await InvestmentService.createInvestment({
        user_id: user.id,
        property_id: property.id,
        shares_purchased: calculation.sharesPurchased,
        investment_amount: Math.round(calculation.actualAmount * 100), // Convert to cents
        purchase_price_per_share: Math.round(pricePerShareMAD * 100), // Convert to cents
        payment_method: 'credit_card',
        notes: `Investment in ${property.title}`
      });

      if (result.success) {
        setSuccess(true);
        setStep('payment');
        
        // Simulate payment processing
        setTimeout(() => {
          // Trigger data refresh in parent components
          if (onSuccess) {
            onSuccess();
          }
          // Force refresh of current page data
          window.location.reload();
          handleClose();
        }, 3000);
      } else {
        setError(result.error || 'Failed to create investment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Investment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setInvestmentAmount('');
    setError(null);
    setSuccess(false);
    setStep('calculate');
    setIsProcessing(false);
    onClose();
  };

  const renderCalculateStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-igudar-primary/5 rounded-lg">
            <div className="flex items-center justify-center text-igudar-primary mb-1">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span className="text-xs font-medium">Expected ROI</span>
            </div>
            <div className="text-lg font-bold text-igudar-text">{property.expected_roi}%</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <DollarSign className="mr-1 h-3 w-3" />
              <span className="text-xs font-medium">Price per Share</span>
            </div>
            <div className="text-lg font-bold text-green-700">{formatPrice(pricePerShareMAD)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="investment-amount" className="text-sm font-medium">
            Investment Amount (MAD)
          </Label>
          <Input
            id="investment-amount"
            type="text"
            placeholder={`Min: ${formatPrice(minInvestmentMAD)}`}
            value={investmentAmount}
            onChange={(e) => handleAmountChange(e.target.value)}
            className="text-right text-lg"
          />
          <div className="text-xs text-igudar-text-muted">
            Available shares: {property.shares_available.toLocaleString()}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {calculation && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
            <h4 className="font-medium text-igudar-text">Investment Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Shares to Purchase</span>
                <span className="font-semibold">{calculation.sharesPurchased.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Actual Investment</span>
                <span className="font-semibold">{formatPrice(calculation.actualAmount)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Expected Monthly Return</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(calculation.expectedMonthlyReturn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Expected Annual Return</span>
                <span className="font-semibold text-green-600">
                  {formatPrice(calculation.expectedAnnualReturn)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={handleClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleProceedToConfirm}
          disabled={!calculation || calculation.actualAmount < minInvestmentMAD}
          className="flex-1 bg-igudar-primary hover:bg-igudar-primary/90 text-white"
        >
          Proceed to Confirm
        </Button>
      </div>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Please review your investment details before confirming. This action cannot be undone.
        </AlertDescription>
      </Alert>

      {calculation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Investment Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Property</span>
                <span className="font-semibold text-right max-w-xs">{property.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Shares</span>
                <span className="font-semibold">{calculation.sharesPurchased.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-igudar-text-secondary">Price per Share</span>
                <span className="font-semibold">{formatPrice(pricePerShareMAD)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Investment</span>
                <span className="font-bold text-igudar-primary">
                  {formatPrice(calculation.actualAmount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm text-green-700 mb-1">Expected Returns</div>
              <div className="text-sm">
                <div>Monthly: <span className="font-semibold">{formatPrice(calculation.expectedMonthlyReturn)}</span></div>
                <div>Annual: <span className="font-semibold">{formatPrice(calculation.expectedAnnualReturn)}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={() => setStep('calculate')}
          className="flex-1"
          disabled={isProcessing}
        >
          Back
        </Button>
        <Button
          onClick={handleConfirmInvestment}
          disabled={isProcessing}
          className="flex-1 bg-igudar-primary hover:bg-igudar-primary/90 text-white"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Confirm Investment
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="space-y-6 text-center">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-igudar-text mb-2">
          Investment Successful!
        </h3>
        <p className="text-igudar-text-secondary">
          Your investment has been processed successfully. You will receive a confirmation email shortly.
        </p>
      </div>

      {calculation && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="text-sm text-green-700">
            <div>Investment Amount: <span className="font-semibold">{formatPrice(calculation.actualAmount)}</span></div>
            <div>Shares Purchased: <span className="font-semibold">{calculation.sharesPurchased.toLocaleString()}</span></div>
            <div>Property: <span className="font-semibold">{property.title}</span></div>
          </div>
        </div>
      )}

      <div className="text-xs text-igudar-text-muted">
        Redirecting to your investments...
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-igudar-text">
              {step === 'calculate' && (
                <>
                  <Calculator className="mr-2 h-5 w-5 inline" />
                  Invest in Property
                </>
              )}
              {step === 'confirm' && 'Confirm Investment'}
              {step === 'payment' && 'Investment Complete'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="mt-4">
          {step === 'calculate' && renderCalculateStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'payment' && renderPaymentStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
};