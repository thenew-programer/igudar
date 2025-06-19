'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { ProfileService, PasswordUpdateData } from '@/lib/profile';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Loader2,
	AlertCircle,
	Shield,
	Save,
	Key,
	Smartphone,
	Eye,
	EyeOff,
	AlertTriangle,
	CheckCircle,
	Clock,
	MapPin,
	Monitor,
	Trash2,
	Download,
	Lock,
	Unlock,
	RefreshCw,
	QrCode,
	Copy,
	Check
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SecurityPage() {
	const { user, loading: authLoading } = useAuth();
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
	const [showQRCode, setShowQRCode] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [passwordSuccess, setPasswordSuccess] = useState(false);
	const [backupCodes, setBackupCodes] = useState<string[]>([]);
	const [copiedCode, setCopiedCode] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	const [securitySettings, setSecuritySettings] = useState({
		loginAlerts: true,
		deviceTracking: true,
		sessionTimeout: true,
		ipWhitelist: false
	});

	// Mock login sessions data
	const loginSessions = [
		{
			id: '1',
			device: 'Chrome on Windows',
			location: 'Casablanca, Morocco',
			ip: '192.168.1.100',
			lastActive: '2 minutes ago',
			current: true
		},
		{
			id: '2',
			device: 'Safari on iPhone',
			location: 'Rabat, Morocco',
			ip: '192.168.1.101',
			lastActive: '1 hour ago',
			current: false
		},
		{
			id: '3',
			device: 'Firefox on MacOS',
			location: 'Marrakech, Morocco',
			ip: '192.168.1.102',
			lastActive: '2 days ago',
			current: false
		}
	];

	const handlePasswordChange = (field: string, value: string) => {
		setPasswordForm(prev => ({ ...prev, [field]: value }));
	};

	const handleSecuritySettingChange = (setting: string, value: boolean) => {
		setSecuritySettings(prev => ({ ...prev, [setting]: value }));
	};

	const handlePasswordSubmit = async () => {
		if (!user?.id) return;

		// Validate passwords
		if (!passwordForm.currentPassword) {
			setError('Current password is required');
			return;
		}

		if (!passwordForm.newPassword) {
			setError('New password is required');
			return;
		}

		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setError('New passwords do not match');
			return;
		}

		if (passwordForm.newPassword.length < 8) {
			setError('New password must be at least 8 characters long');
			return;
		}

		setIsSubmitting(true);
		setError(null);

		try {
			const result = await ProfileService.updatePassword(user.id, {
				currentPassword: passwordForm.currentPassword,
				newPassword: passwordForm.newPassword
			});

			if (result.success) {
				setPasswordSuccess(true);
				setPasswordForm({
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				});

				// Hide success message after 3 seconds
				setTimeout(() => {
					setPasswordSuccess(false);
				}, 3000);
			} else {
				setError(result.error || 'Failed to update password');
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
			console.error('Password update error:', err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEnable2FA = () => {
		setShowQRCode(true);
		// Generate backup codes
		const codes = Array.from({ length: 8 }, () =>
			Math.random().toString(36).substring(2, 8).toUpperCase()
		);
		setBackupCodes(codes);
	};

	const handleConfirm2FA = () => {
		setTwoFactorEnabled(true);
		setShowQRCode(false);
	};

	const handleDisable2FA = () => {
		setTwoFactorEnabled(false);
		setBackupCodes([]);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		setCopiedCode(text);
		setTimeout(() => setCopiedCode(null), 2000);
	};

	const handleTerminateSession = (sessionId: string) => {
		console.log('Terminate session:', sessionId);
	};

	// Handle authentication loading state
	if (authLoading) {
		return (
			<div className="p-4 md:p-6">
				<div className="max-w-4xl mx-auto space-y-6">
					<Skeleton className="h-10 w-64 mb-2" />
					<Skeleton className="h-4 w-96" />
					<div className="grid gap-6 lg:grid-cols-3">
						<div className="lg:col-span-2 space-y-6">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-64 w-full rounded-lg" />
							))}
						</div>
						<div className="space-y-6">
							{Array.from({ length: 2 }).map((_, i) => (
								<Skeleton key={i} className="h-48 w-full rounded-lg" />
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-4 md:p-6" key={user?.id || 'loading'}>
			<div className="max-w-4xl mx-auto space-y-6">
				{/* Header */}
				<div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
					<div>
						<h1 className="text-2xl md:text-3xl font-bold text-igudar-text">
							Security Settings
						</h1>
						<p className="text-base text-igudar-text-secondary">
							Manage your account security, password, and two-factor authentication
						</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Main Security Settings */}
					<div className="lg:col-span-2 space-y-6">
						{/* Password Settings */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<Key className="mr-2 h-5 w-5" />
									Change Password
								</CardTitle>
								<CardDescription>
									Update your password to keep your account secure
								</CardDescription>
								{passwordSuccess && (
									<Alert className="mt-4 border-green-200 bg-green-50">
										<CheckCircle className="h-4 w-4 text-green-600" />
										<AlertDescription className="text-green-800">
											Password updated successfully!
										</AlertDescription>
									</Alert>
								)}
							</CardHeader>
							<CardContent className="space-y-4">
								{error && (
									<Alert variant="destructive">
										<AlertCircle className="h-4 w-4" />
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								)}

								<div className="space-y-2">
									<Label htmlFor="current-password">Current Password</Label>
									<div className="relative">
										<Input
											id="current-password"
											type={showCurrentPassword ? 'text' : 'password'}
											value={passwordForm.currentPassword}
											onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
											placeholder="Enter your current password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-igudar-text-muted hover:text-igudar-text"
											onClick={() => setShowCurrentPassword(!showCurrentPassword)}
										>
											{showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="new-password">New Password</Label>
									<div className="relative">
										<Input
											id="new-password"
											type={showNewPassword ? 'text' : 'password'}
											value={passwordForm.newPassword}
											onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
											placeholder="Enter your new password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-igudar-text-muted hover:text-igudar-text"
											onClick={() => setShowNewPassword(!showNewPassword)}
										>
											{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="confirm-password">Confirm New Password</Label>
									<div className="relative">
										<Input
											id="confirm-password"
											type={showConfirmPassword ? 'text' : 'password'}
											value={passwordForm.confirmPassword}
											onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
											placeholder="Confirm your new password"
										/>
										<button
											type="button"
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-igudar-text-muted hover:text-igudar-text"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										>
											{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
								</div>

								<div className="pt-4">
									<Button
										onClick={handlePasswordSubmit}
										disabled={isSubmitting}
										className="bg-igudar-primary hover:bg-igudar-primary/90 text-white flex items-center"
									>
										{isSubmitting ? (
											<>
												<Loader2 className="mr-2 h-4 w-4 animate-spin" />
												Updating...
											</>
										) : (
											<>
												<Save className="mr-2 h-4 w-4" />
												Update Password
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>

						{/* Two-Factor Authentication */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<Smartphone className="mr-2 h-5 w-5" />
									Two-Factor Authentication
								</CardTitle>
								<CardDescription>
									Add an extra layer of security to your account
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="flex items-center justify-between p-4 border border-border rounded-lg">
									<div>
										<h4 className="font-medium text-igudar-text">2FA Status</h4>
										<p className="text-sm text-igudar-text-muted">
											{twoFactorEnabled ? 'Two-factor authentication is enabled' : 'Two-factor authentication is disabled'}
										</p>
									</div>
									<div className="flex items-center space-x-2">
										{twoFactorEnabled ? (
											<Badge className="bg-green-100 text-green-800 border-green-200">
												<CheckCircle className="mr-1 h-3 w-3" />
												Enabled
											</Badge>
										) : (
											<Badge variant="outline">
												<AlertTriangle className="mr-1 h-3 w-3" />
												Disabled
											</Badge>
										)}
									</div>
								</div>

								{!twoFactorEnabled && !showQRCode && (
									<div className="text-center py-6">
										<Shield className="h-12 w-12 text-igudar-primary/30 mx-auto mb-4" />
										<h3 className="text-lg font-semibold text-igudar-text mb-2">
											Secure Your Account
										</h3>
										<p className="text-igudar-text-secondary mb-6">
											Enable two-factor authentication to add an extra layer of security to your account.
										</p>
										<Button
											onClick={handleEnable2FA}
											className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
										>
											<QrCode className="mr-2 h-4 w-4" />
											Enable 2FA
										</Button>
									</div>
								)}

								{showQRCode && (
									<div className="space-y-6">
										<Alert>
											<AlertTriangle className="h-4 w-4" />
											<AlertDescription>
												Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.)
											</AlertDescription>
										</Alert>

										<div className="text-center">
											<div className="w-48 h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg mx-auto flex items-center justify-center mb-4">
												<QrCode className="h-16 w-16 text-gray-400" />
											</div>
											<p className="text-sm text-igudar-text-muted">
												Manual entry key: JBSWY3DPEHPK3PXP
											</p>
										</div>

										<div className="space-y-2">
											<Label>Enter verification code</Label>
											<Input
												placeholder="Enter 6-digit code from your app"
												maxLength={6}
												pattern="[0-9]*"
												inputMode="numeric"
											/>
										</div>

										<div className="flex space-x-3">
											<Button
												onClick={handleConfirm2FA}
												className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
											>
												Verify & Enable
											</Button>
											<Button
												variant="outline"
												onClick={() => setShowQRCode(false)}
											>
												Cancel
											</Button>
										</div>
									</div>
								)}

								{twoFactorEnabled && (
									<div className="space-y-4">
										<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
											<div className="flex items-center space-x-2 mb-2">
												<CheckCircle className="h-4 w-4 text-green-600" />
												<span className="font-medium text-green-800">2FA is Active</span>
											</div>
											<p className="text-sm text-green-700">
												Your account is protected with two-factor authentication.
											</p>
										</div>

										{backupCodes.length > 0 && (
											<div className="space-y-3">
												<h4 className="font-medium text-igudar-text">Backup Codes</h4>
												<p className="text-sm text-igudar-text-muted">
													Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
												</p>
												<div className="grid grid-cols-2 gap-2">
													{backupCodes.map((code, index) => (
														<div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
															<code className="text-sm font-mono">{code}</code>
															<button
																onClick={() => copyToClipboard(code)}
																className="text-igudar-primary hover:text-igudar-primary/80"
															>
																{copiedCode === code ? (
																	<Check className="h-3 w-3" />
																) : (
																	<Copy className="h-3 w-3" />
																)}
															</button>
														</div>
													))}
												</div>
												<Button variant="outline" size="sm">
													<Download className="mr-2 h-3 w-3" />
													Download Codes
												</Button>
											</div>
										)}

										<Button
											variant="destructive"
											onClick={handleDisable2FA}
											className="flex items-center"
										>
											<Lock className="mr-2 h-4 w-4" />
											Disable 2FA
										</Button>
									</div>
								)}
							</CardContent>
						</Card>

						{/* Security Preferences */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<Shield className="mr-2 h-5 w-5" />
									Security Preferences
								</CardTitle>
								<CardDescription>
									Configure additional security settings for your account
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label className="text-sm font-medium">Login Alerts</Label>
										<p className="text-xs text-igudar-text-muted">Get notified of new login attempts</p>
									</div>
									<Switch
										checked={securitySettings.loginAlerts}
										onCheckedChange={(checked) => handleSecuritySettingChange('loginAlerts', checked)}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label className="text-sm font-medium">Device Tracking</Label>
										<p className="text-xs text-igudar-text-muted">Track devices that access your account</p>
									</div>
									<Switch
										checked={securitySettings.deviceTracking}
										onCheckedChange={(checked) => handleSecuritySettingChange('deviceTracking', checked)}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label className="text-sm font-medium">Session Timeout</Label>
										<p className="text-xs text-igudar-text-muted">Automatically log out after inactivity</p>
									</div>
									<Switch
										checked={securitySettings.sessionTimeout}
										onCheckedChange={(checked) => handleSecuritySettingChange('sessionTimeout', checked)}
									/>
								</div>

								<div className="flex items-center justify-between">
									<div className="space-y-1">
										<Label className="text-sm font-medium">IP Whitelist</Label>
										<p className="text-xs text-igudar-text-muted">Only allow access from trusted IP addresses</p>
									</div>
									<Switch
										checked={securitySettings.ipWhitelist}
										onCheckedChange={(checked) => handleSecuritySettingChange('ipWhitelist', checked)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Active Sessions */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center text-igudar-text">
									<Monitor className="mr-2 h-5 w-5" />
									Active Sessions
								</CardTitle>
								<CardDescription>
									Manage devices and sessions that have access to your account
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{loginSessions.map((session) => (
									<div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-igudar-primary/10 rounded-lg">
												<Monitor className="h-4 w-4 text-igudar-primary" />
											</div>
											<div>
												<div className="flex items-center space-x-2">
													<h4 className="font-medium text-igudar-text">{session.device}</h4>
													{session.current && (
														<Badge className="bg-green-100 text-green-800 border-green-200">
															Current
														</Badge>
													)}
												</div>
												<div className="flex items-center space-x-4 text-sm text-igudar-text-muted">
													<div className="flex items-center space-x-1">
														<MapPin className="h-3 w-3" />
														<span>{session.location}</span>
													</div>
													<div className="flex items-center space-x-1">
														<Clock className="h-3 w-3" />
														<span>{session.lastActive}</span>
													</div>
												</div>
												<p className="text-xs text-igudar-text-muted">IP: {session.ip}</p>
											</div>
										</div>
										{!session.current && (
											<Button
												variant="outline"
												size="sm"
												onClick={() => handleTerminateSession(session.id)}
											>
												<Trash2 className="mr-2 h-3 w-3" />
												Terminate
											</Button>
										)}
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Security Score */}
						<Card>
							<CardHeader>
								<CardTitle className="text-igudar-text">Security Score</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="text-center mb-4">
									<div className="text-3xl font-bold text-igudar-primary mb-2">
										{twoFactorEnabled ? '85' : '65'}/100
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2">
										<div
											className="bg-igudar-primary h-2 rounded-full transition-all duration-500"
											style={{ width: `${twoFactorEnabled ? '85' : '65'}%` }}
										></div>
									</div>
								</div>
								<div className="space-y-2 text-sm">
									<div className="flex items-center justify-between">
										<span className="text-igudar-text-secondary">Strong Password</span>
										<CheckCircle className="h-4 w-4 text-green-600" />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-igudar-text-secondary">2FA Enabled</span>
										{twoFactorEnabled ? (
											<CheckCircle className="h-4 w-4 text-green-600" />
										) : (
											<AlertTriangle className="h-4 w-4 text-orange-500" />
										)}
									</div>
									<div className="flex items-center justify-between">
										<span className="text-igudar-text-secondary">Email Verified</span>
										<CheckCircle className="h-4 w-4 text-green-600" />
									</div>
									<div className="flex items-center justify-between">
										<span className="text-igudar-text-secondary">Recent Activity</span>
										<CheckCircle className="h-4 w-4 text-green-600" />
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Security Tips */}
						<Card>
							<CardHeader>
								<CardTitle className="text-igudar-text">Security Tips</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
									<h4 className="font-medium text-blue-800 text-sm mb-1">Use Strong Passwords</h4>
									<p className="text-xs text-blue-700">
										Use a combination of letters, numbers, and symbols.
									</p>
								</div>

								<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
									<h4 className="font-medium text-green-800 text-sm mb-1">Enable 2FA</h4>
									<p className="text-xs text-green-700">
										Add an extra layer of security to your account.
									</p>
								</div>

								<div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
									<h4 className="font-medium text-orange-800 text-sm mb-1">Monitor Activity</h4>
									<p className="text-xs text-orange-700">
										Regularly check your account for suspicious activity.
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Emergency Actions */}
						<Card>
							<CardHeader>
								<CardTitle className="text-igudar-text">Emergency Actions</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3">
								<Button variant="outline" className="w-full justify-start">
									<RefreshCw className="mr-2 h-4 w-4" />
									Reset All Sessions
								</Button>

								<Button variant="outline" className="w-full justify-start">
									<Lock className="mr-2 h-4 w-4" />
									Freeze Account
								</Button>

								<Button variant="destructive" className="w-full justify-start">
									<AlertTriangle className="mr-2 h-4 w-4" />
									Report Compromise
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
