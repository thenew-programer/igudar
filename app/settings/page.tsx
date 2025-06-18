'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Smartphone,
  Mail,
  DollarSign,
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Crown,
  Star,
  Zap
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function SettingsPage() {
  const { user, userProfile } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false,
    investment_updates: true,
    dividend_alerts: true,
    property_updates: true
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'MAD',
    timezone: 'Africa/Casablanca',
    theme: 'light',
    dashboard_layout: 'default'
  });

  const [privacy, setPrivacy] = useState({
    profile_visibility: 'private',
    investment_visibility: 'private',
    activity_tracking: true,
    data_analytics: true
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
  };

  const handlePreferenceChange = (key: string, value: string) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handlePrivacyChange = (key: string, value: boolean | string) => {
    setPrivacy(prev => ({ ...prev, [key]: value }));
  };

  const getSubscriptionBadge = (tier: string) => {
    switch (tier) {
      case 'premium':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Star className="mr-1 h-3 w-3" />Premium</Badge>;
      case 'vip':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200"><Crown className="mr-1 h-3 w-3" />VIP</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-igudar-text">
              Settings
            </h1>
            <p className="text-base text-igudar-text-secondary">
              Manage your account settings, preferences, and privacy options
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-igudar-text">
                  <Bell className="mr-2 h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Email Notifications</Label>
                      <p className="text-xs text-igudar-text-muted">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">SMS Notifications</Label>
                      <p className="text-xs text-igudar-text-muted">Get important alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Push Notifications</Label>
                      <p className="text-xs text-igudar-text-muted">Browser and mobile push notifications</p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Investment Updates</Label>
                      <p className="text-xs text-igudar-text-muted">Updates about your investments</p>
                    </div>
                    <Switch
                      checked={notifications.investment_updates}
                      onCheckedChange={(checked) => handleNotificationChange('investment_updates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Dividend Alerts</Label>
                      <p className="text-xs text-igudar-text-muted">Notifications when dividends are paid</p>
                    </div>
                    <Switch
                      checked={notifications.dividend_alerts}
                      onCheckedChange={(checked) => handleNotificationChange('dividend_alerts', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Property Updates</Label>
                      <p className="text-xs text-igudar-text-muted">News about properties you've invested in</p>
                    </div>
                    <Switch
                      checked={notifications.property_updates}
                      onCheckedChange={(checked) => handleNotificationChange('property_updates', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Marketing Communications</Label>
                      <p className="text-xs text-igudar-text-muted">Promotional content and news</p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) => handleNotificationChange('marketing', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-igudar-text">
                  <Settings className="mr-2 h-5 w-5" />
                  App Preferences
                </CardTitle>
                <CardDescription>
                  Customize your app experience and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select value={preferences.language} onValueChange={(value) => handlePreferenceChange('language', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="ar">العربية</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={preferences.currency} onValueChange={(value) => handlePreferenceChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MAD">MAD (Moroccan Dirham)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={preferences.timezone} onValueChange={(value) => handlePreferenceChange('timezone', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Casablanca">Morocco (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT)</SelectItem>
                        <SelectItem value="Europe/Paris">Paris (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={preferences.theme} onValueChange={(value) => handlePreferenceChange('theme', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Dashboard Layout</Label>
                  <Select value={preferences.dashboard_layout} onValueChange={(value) => handlePreferenceChange('dashboard_layout', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-igudar-text">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Control your privacy settings and data usage preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <Select value={privacy.profile_visibility} onValueChange={(value) => handlePrivacyChange('profile_visibility', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="investors_only">Investors Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Investment Portfolio Visibility</Label>
                    <Select value={privacy.investment_visibility} onValueChange={(value) => handlePrivacyChange('investment_visibility', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="summary_only">Summary Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Activity Tracking</Label>
                      <p className="text-xs text-igudar-text-muted">Allow tracking for personalized experience</p>
                    </div>
                    <Switch
                      checked={privacy.activity_tracking}
                      onCheckedChange={(checked) => handlePrivacyChange('activity_tracking', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Data Analytics</Label>
                      <p className="text-xs text-igudar-text-muted">Help improve our services with usage data</p>
                    </div>
                    <Switch
                      checked={privacy.data_analytics}
                      onCheckedChange={(checked) => handlePrivacyChange('data_analytics', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-igudar-text">
                  <Download className="mr-2 h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>
                  Export your data or delete your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-igudar-text">Export Data</h4>
                    <p className="text-sm text-igudar-text-muted">Download all your account data</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-red-800">Delete Account</h4>
                    <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                  </div>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Subscription</span>
                  {getSubscriptionBadge(userProfile?.subscription_tier || 'free')}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">2FA Enabled</span>
                  <Badge variant="outline">
                    Not Set
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  Security Settings
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Notification Center
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Download className="mr-2 h-4 w-4" />
                  Download App
                </Button>
              </CardContent>
            </Card>

            {/* Upgrade Account */}
            {userProfile?.subscription_tier === 'free' && (
              <Card className="bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10 border-igudar-primary/20">
                <CardHeader>
                  <CardTitle className="text-igudar-text flex items-center">
                    <Zap className="mr-2 h-5 w-5 text-igudar-primary" />
                    Unlock Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-igudar-text-secondary space-y-2 mb-4">
                    <li>• Advanced portfolio analytics</li>
                    <li>• Priority customer support</li>
                    <li>• Exclusive investment opportunities</li>
                    <li>• Lower fees and better rates</li>
                  </ul>
                  <Button className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade Now
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Support */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-igudar-text-secondary mb-4">
                  Contact our support team if you need assistance with your settings.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}