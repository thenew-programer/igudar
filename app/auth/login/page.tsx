import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
<<<<<<< HEAD
import { Shield, Users, Star, BarChart3, Target, Zap } from 'lucide-react';
=======
import { TrendingUp, Shield, Users, Star, BarChart3, Target, Zap, Building2 } from 'lucide-react';
>>>>>>> 6109de2 (fix build issues)
import { Suspense } from 'react';
import Image from 'next/image';

export default function LoginPage() {
	return (
		<div className="min-h-screen min-w-full flex overflow-hidden">
			{/* Left Side - Form */}
			<div className="w-full lg:w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
				<div className="w-full max-w-md mx-auto lg:mx-0">
<<<<<<< HEAD
=======
					{/* Logo Section */}
					<div className="mb-10">
						<div className="flex items-center mb-6">
							<Image
								src="/igudar.png"
								alt="IGUDAR Logo"
								width={56}
								height={56}
								className="mr-4"
							/>
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

>>>>>>> 6109de2 (fix build issues)
					{/* Login Form */}
					<Suspense fallback={<div>loading...</div>}>
						<LoginForm />
					</Suspense>
				</div>
			</div>

			{/* Right Side - Interactive Dashboard Preview */}
			<div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center bg-[#0d3b3f] text-white">
				<div className="max-w-xl mx-auto w-full px-12">
					<h2 className="text-5xl font-bold mb-6">Revolutionize QA with Smarter Automation</h2>
					
					<div className="mb-12">
						<blockquote className="text-xl mb-6">
							"SoftQA has completely transformed our testing process. It's reliable, efficient, and ensures our releases are always top-notch."
						</blockquote>
						
						<div className="flex items-center">
							<div className="w-12 h-12 rounded-full bg-white/20 mr-4 flex items-center justify-center">
								<Image 
									src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg" 
									alt="Michael Carter" 
									width={48} 
									height={48}
									className="rounded-full object-cover" 
								/>
							</div>
							<div>
								<p className="font-medium">Michael Carter</p>
								<p className="text-sm text-white/80">Software Engineer at DevCore</p>
							</div>
						</div>
					</div>
					
					<div className="space-y-8">
						<div>
							<p className="text-sm uppercase tracking-wider text-white/70 mb-4">JOIN 1K TEAMS</p>
							<div className="grid grid-cols-4 gap-6">
								{['Discord', 'Mailchimp', 'Grammarly', 'Attentive'].map((company, i) => (
									<div key={i} className="h-8 flex items-center">
										<span className="text-white font-medium">{company}</span>
									</div>
								))}
							</div>
						</div>
						
						<div className="grid grid-cols-4 gap-6">
							{['Hellosign', 'Intercom', 'Square', 'Dropbox'].map((company, i) => (
								<div key={i} className="h-8 flex items-center">
									<span className="text-white font-medium">{company}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
