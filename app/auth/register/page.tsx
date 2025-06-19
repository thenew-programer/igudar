import React from 'react';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function RegisterPage() {
	return (
		<div className="min-h-screen min-w-full bg-gradient-to-br from-slate-50 via-white to-igudar-primary/5 flex flex-col">
			{/* Back to Landing Button */}
			<div className="absolute top-6 left-6 z-10">
				<Link
					href="https://meek-toffee-902e91.netlify.app"
					className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm hover:bg-white border border-slate-200 rounded-xl text-slate-700 hover:text-igudar-primary transition-all duration-200 shadow-sm hover:shadow-md"
				>
					<ArrowLeft className="h-4 w-4 mr-2" />
					<span className="text-sm font-medium">Back to Home</span>
				</Link>
			</div>

			{/* Centered Form Container */}
			<div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					{/* Logo Section */}
					<div className="mb-8 text-center">
						<div className="flex items-center justify-center mb-6">
							<Image
								src="/igudar.png"
								alt="IGUDAR Logo"
								width={100}
								height={100}
								className="mr-4"
							/>
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

					{/* Footer */}
					<div className="mt-6 text-center text-xs text-slate-400">
						<p>&copy; 2025 IGUDAR. All rights reserved. Licensed by AMMC.</p>
					</div>
				</div>
			</div>
		</div>
	);
}
