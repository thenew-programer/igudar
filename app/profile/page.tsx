'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Crown,
  Star,
  TrendingUp,
  Building2,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

export default function ProfilePage() {
  const { user, userProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        avatar_url: userProfile.avatar_url || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setIsEditing(false);
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        avatar_url: userProfile.avatar_url || ''
      });
    }
    setIsEditing(false);
    setError(null);
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

  if (!user || !userProfile) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className="p-4 md:p-6" key={user?.id || 'loading'}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-igudar-text">
              Profile Settings
            </h1>
            <p className="text-base text-igudar-text-secondary">
              Manage your personal information and account preferences
            </p>
          </div>
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-igudar-text">
                  <User className="mr-2 h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-igudar-primary to-igudar-primary/80 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {formData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                    {isEditing && (
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-igudar-primary rounded-full flex items-center justify-center text-white hover:bg-igudar-primary/90 transition-colors">
                        <Camera className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-igudar-text">{formData.full_name}</h3>
                    <p className="text-sm text-igudar-text-muted">Member since {new Date(userProfile.created_at).getFullYear()}</p>
                    {getSubscriptionBadge(userProfile.subscription_tier)}
                  </div>
                </div>

                <Separator />

                {/* Form Fields */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+212 6XX XXX XXX"
                      className={!isEditing ? 'bg-gray-50' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="h-4 w-4 text-igudar-text-muted" />
                      <span className="text-sm text-igudar-text">
                        {new Date(userProfile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="bg-igudar-primary hover:bg-igudar-primary/90 text-white"
                    >
                      {loading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Account Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Account Preferences</CardTitle>
                <CardDescription>
                  Customize your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-igudar-text">Email Notifications</h4>
                    <p className="text-sm text-igudar-text-muted">Receive updates about your investments</p>
                  </div>
                  <div className="w-11 h-6 bg-igudar-primary rounded-full relative">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-igudar-text">SMS Notifications</h4>
                    <p className="text-sm text-igudar-text-muted">Get important alerts via SMS</p>
                  </div>
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <h4 className="font-medium text-igudar-text">Marketing Communications</h4>
                    <p className="text-sm text-igudar-text-muted">Receive news and promotional content</p>
                  </div>
                  <div className="w-11 h-6 bg-gray-200 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Account Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Subscription</span>
                  {getSubscriptionBadge(userProfile.subscription_tier)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Account Status</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Email Verified</span>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Verified
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-igudar-text-secondary">Phone Verified</span>
                  <Badge variant="outline">
                    Pending
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-igudar-text">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-igudar-primary/10 rounded-lg">
                    <Building2 className="h-4 w-4 text-igudar-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-igudar-text">5</div>
                    <div className="text-xs text-igudar-text-muted">Properties Invested</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-igudar-text">125,000 MAD</div>
                    <div className="text-xs text-igudar-text-muted">Total Invested</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-igudar-text">+12.5%</div>
                    <div className="text-xs text-igudar-text-muted">Portfolio ROI</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Account */}
            {userProfile.subscription_tier === 'free' && (
              <Card className="bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10 border-igudar-primary/20">
                <CardHeader>
                  <CardTitle className="text-igudar-text flex items-center">
                    <Crown className="mr-2 h-5 w-5 text-igudar-primary" />
                    Upgrade Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-igudar-text-secondary mb-4">
                    Unlock premium features and get access to exclusive investment opportunities.
                  </p>
                  <Button className="w-full bg-igudar-primary hover:bg-igudar-primary/90 text-white">
                    Upgrade to Premium
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Skeleton className="w-20 h-20 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};