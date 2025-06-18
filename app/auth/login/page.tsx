import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { Building2, TrendingUp, Shield, Users, Star, BarChart3, Target, Zap } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="min-h-screen min-w-full bg-gradient-to-br from-slate-50 via-white to-igudar-primary/5 flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          {/* Logo Section */}
          <div className="mb-10">
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
                Welcome back
              </h2>
              <p className="text-lg text-slate-600">
                Continue building your wealth through smart real estate investments
              </p>
            </div>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Trust Indicators */}
          <div className="mt-8 pt-6 border-t border-slate-200">
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
          <div className="mt-8 text-center text-xs text-slate-400">
            <p>&copy; 2025 IGUDAR. All rights reserved. Licensed by AMMC.</p>
          </div>
        </div>
      </div>

      {/* Right Side - Interactive Dashboard Preview */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-8 xl:px-12 bg-gradient-to-br from-igudar-primary/5 to-igudar-primary/10">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-igudar-primary/20 mb-6">
              <Zap className="h-4 w-4 text-igudar-primary mr-2" />
              <span className="text-sm font-medium text-igudar-primary">Live Portfolio Dashboard</span>
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-4">
              Track Your Real Estate Empire
            </h3>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Monitor your investments, track performance, and discover new opportunities in Morocco's premium real estate market.
            </p>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative">
            {/* Main Dashboard Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Dashboard Header */}
              <div className="bg-gradient-to-r from-igudar-primary to-igudar-primary/90 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Investment Portfolio</h4>
                      <p className="text-white/80 text-sm">Real-time performance</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">245,750 MAD</div>
                    <div className="text-white/80 text-sm">+12.5% this month</div>
                  </div>
                </div>
              </div>

              {/* Dashboard Content */}
              <div className="p-6 space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-green-800">+15.2%</div>
                    <div className="text-xs text-green-600 font-medium">Annual ROI</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
                    <Building2 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-blue-800">8</div>
                    <div className="text-xs text-blue-600 font-medium">Properties</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200">
                    <Target className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <div className="text-xl font-bold text-purple-800">1,247</div>
                    <div className="text-xs text-purple-600 font-medium">Shares</div>
                  </div>
                </div>

                {/* Recent Investments */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-slate-900 text-sm">Recent Investments</h5>
                  <div className="space-y-3">
                    {[
                      { name: 'Marina Luxury Towers', location: 'Casablanca', return: '+8.2%', amount: '25K', status: 'active' },
                      { name: 'Medina Heritage Riad', location: 'Marrakech', return: '+15.1%', amount: '50K', status: 'funded' },
                      { name: 'Business District Office', location: 'Rabat', return: '+6.8%', amount: '35K', status: 'active' }
                    ].map((investment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-igudar-primary/20 to-igudar-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-igudar-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 text-sm">{investment.name}</div>
                            <div className="text-xs text-slate-500">{investment.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-green-600">{investment.return}</div>
                          <div className="text-xs text-slate-500">{investment.amount} MAD</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 grid grid-cols-4 gap-4">
            {[
              { icon: Shield, label: 'Secure', desc: 'Bank-level security' },
              { icon: TrendingUp, label: 'Profitable', desc: 'High returns' },
              { icon: Users, label: 'Trusted', desc: '1000+ investors' },
              { icon: Star, label: 'Premium', desc: 'Curated properties' }
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