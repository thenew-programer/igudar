import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { Building2, TrendingUp, MapPin, Star, Users, Shield, Zap, Target, BarChart3 } from 'lucide-react';

export default function RegisterPage() {
  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-50 via-white to-igudar-primary/5 flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo Section */}
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-igudar-primary to-igudar-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-igudar-primary to-igudar-primary/80 bg-clip-text text-transparent">
                  IGUDAR
                </h1>
                <p className="text-sm text-slate-600 font-medium">
                  Real Estate Investment Platform
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-slate-900">
                Start investing today
              </h2>
              <p className="text-lg text-slate-600">
                Join thousands building wealth through fractional real estate ownership
              </p>
            </div>
          </div>

          {/* Register Form */}
          <RegisterForm />

          {/* Trust Indicators */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-900">1000+</div>
                <div className="text-xs text-slate-500">Active Investors</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-900">50M+</div>
                <div className="text-xs text-slate-500">MAD Invested</div>
              </div>
              <div className="space-y-1">
                <div className="text-lg font-bold text-slate-900">12.5%</div>
                <div className="text-xs text-slate-500">Avg Returns</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>&copy; 2025 IGUDAR. All rights reserved. Licensed by AMMC.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Property Marketplace Preview */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-igudar-primary/20 mb-6">
              <Zap className="h-4 w-4 text-igudar-primary mr-2" />
              <span className="text-sm font-medium text-igudar-primary">Premium Property Marketplace</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Discover Premium Properties
            </h3>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Access exclusive real estate opportunities across Morocco's most desirable locations with investments starting from 1,000 MAD.
            </p>
          </div>

          {/* Property Marketplace Mockup */}
          <div className="relative">
            {/* Main Marketplace Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Marketplace Header */}
              <div className="bg-gradient-to-r from-igudar-primary to-igudar-primary/90 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Property Marketplace</h4>
                      <p className="text-white/80 text-sm">Curated investments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">15 Properties</div>
                    <div className="text-white/80 text-sm">Available now</div>
                  </div>
                </div>
              </div>

              {/* Property Cards */}
              <div className="p-6 space-y-4">
                {[
                  {
                    title: 'Marina Luxury Towers',
                    location: 'Casablanca Marina',
                    type: 'Residential',
                    roi: '12.5%',
                    minInvest: '25K',
                    progress: 75,
                    status: 'Active',
                    gradient: 'from-blue-500 to-blue-600'
                  },
                  {
                    title: 'Heritage Riad Collection',
                    location: 'Marrakech Medina',
                    type: 'Hospitality',
                    roi: '15.8%',
                    minInvest: '50K',
                    progress: 45,
                    status: 'Funding',
                    gradient: 'from-orange-500 to-red-500'
                  },
                  {
                    title: 'Business District Plaza',
                    location: 'Rabat Agdal',
                    type: 'Commercial',
                    roi: '10.2%',
                    minInvest: '100K',
                    progress: 90,
                    status: 'Almost Full',
                    gradient: 'from-green-500 to-emerald-600'
                  }
                ].map((property, index) => (
                  <div key={index} className="group hover:shadow-lg transition-all duration-300 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    <div className={`h-24 bg-gradient-to-r ${property.gradient} relative`}>
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          property.status === 'Active' ? 'bg-green-500 text-white' :
                          property.status === 'Funding' ? 'bg-blue-500 text-white' :
                          'bg-purple-500 text-white'
                        }`}>
                          {property.status}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 text-slate-800 text-xs px-2 py-1 rounded-full font-medium">
                          {property.type}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-1">{property.title}</h4>
                      <div className="flex items-center text-slate-500 text-sm mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{property.location}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-slate-500">Min Investment</div>
                          <div className="font-semibold text-igudar-primary">{property.minInvest} MAD</div>
                        </div>
                        <div>
                          <div className="text-xs text-slate-500">Expected ROI</div>
                          <div className="font-semibold text-green-600">{property.roi}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Funding Progress</span>
                          <span>{property.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-igudar-primary h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${property.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-igudar-primary to-igudar-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            {[
              { icon: Star, label: 'Premium', desc: 'Curated properties' },
              { icon: TrendingUp, label: 'Growth', desc: 'Consistent returns' },
              { icon: MapPin, label: 'Locations', desc: 'Prime areas' },
              { icon: Shield, label: 'Secure', desc: 'Protected investments' }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20">
                  <feature.icon className="h-5 w-5 text-igudar-primary" />
                </div>
                <h4 className="font-semibold text-slate-900 text-sm">{feature.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}