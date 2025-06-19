'use client';

import React from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
	CreditCard,
	Download,
	Calendar,
	DollarSign,
	FileText,
	Clock,
	CheckCircle,
	AlertCircle,
	TrendingUp,
	Plus,
	Trash2,
	Edit,
	Loader2,
	MapPin,
	Save
} from 'lucide-react';
import { ProfileService, PaymentMethod, BillingAddress } from '@/lib/profile';

export default function BillingPage() {
	const { user, loading: authLoading } = useAuth();
	// Mock billing data - in real app this would come from API
	const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
	const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
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

	// New payment method state
	const [isAddingCard, setIsAddingCard] = useState(false);
	const [isEditingAddress, setIsEditingAddress] = useState(false);
	const [cardForm, setCardForm] = useState({
		cardNumber: '',
		cardHolder: '',
		expiryMonth: '',
		expiryYear: '',
		cvv: '',
		setAsDefault: true
	});
	const [addressForm, setAddressForm] = useState<BillingAddress>({
		full_name: '',
		address_line1: '',
		address_line2: '',
		city: '',
		postal_code: '',
		country: 'Morocco'
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [formSuccess, setFormSuccess] = useState(false);
	const [formError, setFormError] = useState<string | null>(null);

	// Fetch payment methods and billing address
	useEffect(() => {
		const fetchData = async () => {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);

				// Fetch payment methods
				const paymentResult = await ProfileService.getPaymentMethods(user.id);
				if (paymentResult.success) {
					setPaymentMethods(paymentResult.data || []);
				}

				// Fetch billing address
				const addressResult = await ProfileService.getBillingAddress(user.id);
				if (addressResult.success && addressResult.data) {
					setBillingAddress(addressResult.data);
					setAddressForm(addressResult.data);
				}
			} catch (err) {
				console.error('Error fetching billing data:', err);
				setError('Failed to load billing information');
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [user?.id]);

	// Handle card form submission
	const handleAddCard = async () => {
		if (!user?.id) return;

		// Basic validation
		if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiryMonth || !cardForm.expiryYear || !cardForm.cvv) {
			setFormError('Please fill in all card details');
			return;
		}

		setIsSubmitting(true);
		setFormError(null);

		try {
			// In a real app, you would use a payment processor like Stripe
			// For this demo, we'll simulate adding a card
			const last4 = cardForm.cardNumber.slice(-4);
			const cardBrand = getCardBrand(cardForm.cardNumber);

			const result = await ProfileService.addPaymentMethod(user.id, {
				card_brand: cardBrand,
				last4,
				exp_month: parseInt(cardForm.expiryMonth),
				exp_year: parseInt(cardForm.expiryYear),
				set_as_default: cardForm.setAsDefault
			});

			if (result.success) {
				setFormSuccess(true);

				// Refresh payment methods
				const updatedMethods = await ProfileService.getPaymentMethods(user.id);
				if (updatedMethods.success) {
					setPaymentMethods(updatedMethods.data || []);
				}

				// Reset form and close dialog
				setTimeout(() => {
					setCardForm({
						cardNumber: '',
						cardHolder: '',
						expiryMonth: '',
						expiryYear: '',
						cvv: '',
						setAsDefault: true
					});
					setFormSuccess(false);
					setIsAddingCard(false);
				}, 2000);
			} else {
				setFormError(result.error || 'Failed to add payment method');
			}
		} catch (err) {
			setFormError('An unexpected error occurred');
			console.error('Error adding payment method:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

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

	// Get card brand based on card number
	const getCardBrand = (cardNumber: string): string => {
		// Very basic detection - in a real app, use a proper library
		if (cardNumber.startsWith('4')) return 'Visa';
		if (cardNumber.startsWith('5')) return 'Mastercard';
		if (cardNumber.startsWith('3')) return 'American Express';
		if (cardNumber.startsWith('6')) return 'Discover';
		return 'Unknown';
	};

	// Get card brand color
	const getCardBrandColor = (brand: string): string => {
		switch (brand.toLowerCase()) {
			case 'visa':
				return 'from-blue-600 to-blue-800';
			case 'mastercard':
				return 'from-red-600 to-orange-600';
			case 'american express':
				return 'from-green-600 to-green-800';
			default:
				return 'from-gray-600 to-gray-800';
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

	// Handle authentication loading state
	if (authLoading) {
		return (
			<div className="p-6">
				<div className="max-w-6xl mx-auto space-y-8">
					<Skeleton className="h-10 w-64 mb-2" />
					<Skeleton className="h-4 w-96" />
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{Array.from({ length: 4 }).map((_, i) => (
							<Skeleton key={i} className="h-32 w-full rounded-lg" />
						))}
					</div>
					<Skeleton className="h-64 w-full rounded-lg" />
					<Skeleton className="h-96 w-full rounded-lg" />
				</div>
			</div>
		);
	}

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
				<Card id="payment-methods">
					<CardHeader>
						<CardTitle className="flex items-center text-igudar-text">
							<CreditCard className="mr-2 h-5 w-5" />
							Payment Methods
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-4">
							{loading ? (
								// Loading skeleton
								Array.from({ length: 2 }).map((_, index) => (
									<div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
											<div className="space-y-2">
												<div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
												<div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
											</div>
										</div>
										<div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
									</div>
								))
							) : paymentMethods.length > 0 ? (
								// Payment methods list
								paymentMethods.map((method) => (
									<div key={method.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div className="flex items-center space-x-4">
											<div className={`w-12 h-8 bg-gradient-to-r ${getCardBrandColor(method.card_brand)} rounded flex items-center justify-center`}>
												<span className="text-white text-xs font-bold">{method.card_brand.toUpperCase()}</span>
											</div>
											<div>
												<div className="font-medium text-igudar-text">•••• •••• •••• {method.last4}</div>
												<div className="text-sm text-igudar-text-muted">
													Expires {method.exp_month.toString().padStart(2, '0')}/{method.exp_year.toString().slice(-2)}
												</div>
											</div>
											{method.is_default && (
												<Badge className="bg-green-100 text-green-800 border-green-200">
													Default
												</Badge>
											)}
										</div>
										<div className="flex space-x-2">
											{!method.is_default && (
												<Button
													variant="outline"
													size="sm"
													onClick={async () => {
														if (!user?.id) return;
														try {
															await ProfileService.setDefaultPaymentMethod(user.id, method.id);
															// Refresh payment methods
															const result = await ProfileService.getPaymentMethods(user.id);
															if (result.success) {
																setPaymentMethods(result.data || []);
															}
														} catch (err) {
															console.error('Error setting default payment method:', err);
														}
													}}
												>
													Set Default
												</Button>
											)}
											<Button
												variant="outline"
												size="sm"
												className="text-red-500 hover:text-red-700 hover:bg-red-50"
												onClick={async () => {
													if (!user?.id) return;
													if (!confirm('Are you sure you want to remove this payment method?')) return;

													try {
														await ProfileService.removePaymentMethod(user.id, method.id);
														// Refresh payment methods
														const result = await ProfileService.getPaymentMethods(user.id);
														if (result.success) {
															setPaymentMethods(result.data || []);
														}
													} catch (err) {
														console.error('Error removing payment method:', err);
													}
												}}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>
								))
							) : (
								// Empty state
								<div className="text-center py-6">
									<CreditCard className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
									<h3 className="text-lg font-semibold text-igudar-text mb-2">No Payment Methods</h3>
									<p className="text-igudar-text-muted mb-4">
										You haven't added any payment methods yet.
									</p>
								</div>
							)}

							{/* Add Payment Method Dialog */}
							<Dialog open={isAddingCard} onOpenChange={setIsAddingCard}>
								<DialogTrigger asChild>
									<Button variant="outline" className="w-full border-dashed">
										<CreditCard className="mr-2 h-4 w-4" />
										Add New Payment Method
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>Add Payment Method</DialogTitle>
									</DialogHeader>

									<div className="space-y-4 py-4">
										{formSuccess ? (
											<div className="text-center py-4">
												<CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-igudar-text mb-2">Card Added Successfully!</h3>
												<p className="text-igudar-text-secondary">
													Your payment method has been added to your account.
												</p>
											</div>
										) : (
											<>
												{formError && (
													<Alert variant="destructive">
														<AlertCircle className="h-4 w-4" />
														<AlertDescription>{formError}</AlertDescription>
													</Alert>
												)}

												<div className="space-y-2">
													<Label htmlFor="cardNumber">Card Number</Label>
													<Input
														id="cardNumber"
														placeholder="1234 5678 9012 3456"
														value={cardForm.cardNumber}
														onChange={(e) => setCardForm(prev => ({ ...prev, cardNumber: e.target.value }))}
														maxLength={19}
													/>
												</div>

												<div className="space-y-2">
													<Label htmlFor="cardHolder">Cardholder Name</Label>
													<Input
														id="cardHolder"
														placeholder="John Doe"
														value={cardForm.cardHolder}
														onChange={(e) => setCardForm(prev => ({ ...prev, cardHolder: e.target.value }))}
													/>
												</div>

												<div className="grid grid-cols-3 gap-4">
													<div className="space-y-2">
														<Label htmlFor="expiryMonth">Month</Label>
														<Select
															value={cardForm.expiryMonth}
															onValueChange={(value) => setCardForm(prev => ({ ...prev, expiryMonth: value }))}
														>
															<SelectTrigger id="expiryMonth">
																<SelectValue placeholder="MM" />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
																	<SelectItem key={month} value={month.toString().padStart(2, '0')}>
																		{month.toString().padStart(2, '0')}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>

													<div className="space-y-2">
														<Label htmlFor="expiryYear">Year</Label>
														<Select
															value={cardForm.expiryYear}
															onValueChange={(value) => setCardForm(prev => ({ ...prev, expiryYear: value }))}
														>
															<SelectTrigger id="expiryYear">
																<SelectValue placeholder="YY" />
															</SelectTrigger>
															<SelectContent>
																{Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
																	<SelectItem key={year} value={year.toString()}>
																		{year}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>

													<div className="space-y-2">
														<Label htmlFor="cvv">CVV</Label>
														<Input
															id="cvv"
															placeholder="123"
															value={cardForm.cvv}
															onChange={(e) => setCardForm(prev => ({ ...prev, cvv: e.target.value }))}
															maxLength={4}
														/>
													</div>
												</div>

												<div className="flex items-center space-x-2 pt-2">
													<input
														type="checkbox"
														id="setAsDefault"
														checked={cardForm.setAsDefault}
														onChange={(e) => setCardForm(prev => ({ ...prev, setAsDefault: e.target.checked }))}
														className="h-4 w-4 text-igudar-primary focus:ring-igudar-primary border-gray-300 rounded"
													/>
													<Label htmlFor="setAsDefault" className="text-sm">Set as default payment method</Label>
												</div>

												<Button
													onClick={handleAddCard}
													disabled={isSubmitting}
													className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white mt-4"
												>
													{isSubmitting ? (
														<>
															<Loader2 className="mr-2 h-4 w-4 animate-spin" />
															Processing...
														</>
													) : (
														<>
															<Plus className="mr-2 h-4 w-4" />
															Add Card
														</>
													)}
												</Button>
											</>
										)}
									</div>
								</DialogContent>
							</Dialog>
						</div>
					</CardContent>
				</Card>

				{/* Billing Address */}
				<Card id="billing-address">
					<CardHeader>
						<CardTitle className="flex items-center text-igudar-text">
							<MapPin className="mr-2 h-5 w-5" />
							Billing Address
						</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className="space-y-2">
								<div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
								<div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
							</div>
						) : billingAddress ? (
							<div className="space-y-2">
								<p className="font-medium text-igudar-text">{billingAddress.full_name}</p>
								<p className="text-igudar-text-secondary">{billingAddress.address_line1}</p>
								{billingAddress.address_line2 && (
									<p className="text-igudar-text-secondary">{billingAddress.address_line2}</p>
								)}
								<p className="text-igudar-text-secondary">
									{billingAddress.city}, {billingAddress.postal_code}
								</p>
								<p className="text-igudar-text-secondary">{billingAddress.country}</p>

								<div className="pt-4">
									<Button
										variant="outline"
										size="sm"
										onClick={() => setIsEditingAddress(true)}
									>
										<Edit className="mr-2 h-4 w-4" />
										Edit Address
									</Button>
								</div>
							</div>
						) : (
							<div className="text-center py-6">
								<MapPin className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-igudar-text mb-2">No Billing Address</h3>
								<p className="text-igudar-text-muted mb-4">
									You haven't added a billing address yet.
								</p>
								<Button
									variant="outline"
									onClick={() => setIsEditingAddress(true)}
								>
									<Plus className="mr-2 h-4 w-4" />
									Add Billing Address
								</Button>
							</div>
						)}

						{/* Edit Address Dialog */}
						{isEditingAddress && (
							<Dialog open={isEditingAddress} onOpenChange={setIsEditingAddress}>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>{billingAddress ? 'Edit' : 'Add'} Billing Address</DialogTitle>
									</DialogHeader>

									<div className="space-y-4 py-4">
										{formError && (
											<Alert variant="destructive">
												<AlertCircle className="h-4 w-4" />
												<AlertDescription>{formError}</AlertDescription>
											</Alert>
										)}

										<div className="space-y-2">
											<Label htmlFor="fullName">Full Name</Label>
											<Input
												id="fullName"
												placeholder="John Doe"
												value={addressForm.full_name}
												onChange={(e) => setAddressForm(prev => ({ ...prev, full_name: e.target.value }))}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="addressLine1">Address Line 1</Label>
											<Input
												id="addressLine1"
												placeholder="123 Main St"
												value={addressForm.address_line1}
												onChange={(e) => setAddressForm(prev => ({ ...prev, address_line1: e.target.value }))}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
											<Input
												id="addressLine2"
												placeholder="Apt 4B"
												value={addressForm.address_line2 || ''}
												onChange={(e) => setAddressForm(prev => ({ ...prev, address_line2: e.target.value }))}
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="city">City</Label>
												<Input
													id="city"
													placeholder="Casablanca"
													value={addressForm.city}
													onChange={(e) => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
												/>
											</div>

											<div className="space-y-2">
												<Label htmlFor="postalCode">Postal Code</Label>
												<Input
													id="postalCode"
													placeholder="20000"
													value={addressForm.postal_code}
													onChange={(e) => setAddressForm(prev => ({ ...prev, postal_code: e.target.value }))}
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="country">Country</Label>
											<Select
												value={addressForm.country}
												onValueChange={(value) => setAddressForm(prev => ({ ...prev, country: value }))}
											>
												<SelectTrigger id="country">
													<SelectValue placeholder="Select country" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="Morocco">Morocco</SelectItem>
													<SelectItem value="France">France</SelectItem>
													<SelectItem value="Spain">Spain</SelectItem>
													<SelectItem value="United States">United States</SelectItem>
													<SelectItem value="United Kingdom">United Kingdom</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<Button
											onClick={async () => {
												if (!user?.id) return;

												// Basic validation
												if (!addressForm.full_name || !addressForm.address_line1 || !addressForm.city || !addressForm.postal_code) {
													setFormError('Please fill in all required fields');
													return;
												}

												setIsSubmitting(true);
												setFormError(null);

												try {
													const result = await ProfileService.updateBillingAddress(user.id, addressForm);

													if (result.success) {
														setBillingAddress(result.data ?? null);
														setIsEditingAddress(false);
													} else {
														setFormError(result.error || 'Failed to update billing address');
													}
												} catch (err) {
													setFormError('An unexpected error occurred');
													console.error('Error updating billing address:', err);
												} finally {
													setIsSubmitting(false);
												}
											}}
											disabled={isSubmitting}
											className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white mt-4"
										>
											{isSubmitting ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Saving...
												</>
											) : (
												<>
													<Save className="mr-2 h-4 w-4" />
													Save Address
												</>
											)}
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						)}
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
												<StatusIcon className={`h-4 w-4 ${transaction.status === 'completed' ? 'text-green-600' :
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
				<Card id="tax-information">
					<CardHeader>
						<CardTitle className="text-igudar-text">Tax Information</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-6">
							<h4 className="font-medium text-igudar-text mb-3">Tax Information</h4>
							<div className="space-y-2 text-sm text-igudar-text-secondary">
								<div>Tax ID: MA123456789</div>
								<div>VAT Number: Not applicable</div>
								<div>Tax Status: Individual</div>
							</div>
							<Button variant="outline" size="sm">
								Update Tax Info
							</Button>

							<Separator />

							<p className="text-sm text-igudar-text-muted">
								Tax information is used for regulatory compliance and reporting purposes.
								All financial transactions are subject to applicable tax laws in Morocco.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
