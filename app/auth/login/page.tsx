import React from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { ArrowLeft } from 'lucide-react';
import { Suspense } from 'react';
import Link from 'next/link';

export default function LoginPage() {
	return (
		<div className="min-h-screen min-w-full flex flex-col bg-white">
			<div className="absolute top-4 left-4 z-10">
				<Link
					href="https://meek-toffee-902e91.netlify.app"
					className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
				>
					<ArrowLeft className="w-4 h-4" />
					<span className="text-sm font-medium">Back to Home</span>
				</Link>
			</div>

			<div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
				<div className="w-full max-w-md">
					<Suspense fallback={<div className="text-center">Loading...</div>}>
						<LoginForm />
					</Suspense>
				</div>
			</div>
		</div>
	);
}
