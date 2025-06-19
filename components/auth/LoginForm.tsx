'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
<<<<<<< HEAD
import Image from 'next/image';
=======
>>>>>>> 6109de2 (fix build issues)

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signIn } from '@/lib/auth';

const loginSchema = z.object({
	email: z.string().email('Please enter a valid email address'),
	password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
	onSuccess?: () => void;
	redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
	onSuccess = null,
	redirectTo = '/dashboard'
}) => {
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const searchParams = useSearchParams();

	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	const onSubmit = async (data: LoginFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const result = await signIn(data);

			if (result.success) {
				const redirectParam = searchParams.get('redirectTo') || redirectTo;
				if (onSuccess) {
					onSuccess();
				} else {
					window.location.href = redirectParam;
				}
			} else {
				setError(result.error || 'Sign in failed. Please try again.');
			}
		} catch (err) {
			setError('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
<<<<<<< HEAD
				<div className="flex items-center mb-10">
					<Image 
						src="/igudar.svg" 
						alt="SoftQA" 
						width={40} 
						height={40} 
						className="mr-3"
					/>
					<h1 className="text-xl font-semibold">SoftQA</h1>
				</div>
				
				<div className="mb-8">
					<h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
					<p className="text-gray-600">Sign in to access your dashboard and continue optimizing your QA process.</p>
				</div>

=======
>>>>>>> 6109de2 (fix build issues)
				{error && (
					<Alert variant="destructive" className="border-red-200 bg-red-50">
						<AlertDescription className="text-red-800">{error}</AlertDescription>
					</Alert>
				)}

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-sm font-medium text-slate-700">
							Email
						</Label>
						<div className="relative">
							<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
							<Input
								id="email"
								type="email"
								placeholder="Enter your email"
								className={`pl-11 h-12 bg-white border-slate-300 focus:border-[#0d3b3f] focus:ring-[#0d3b3f]/20 ${errors.email ? 'border-red-300 focus:border-red-500' : ''
									}`}
								{...register('email')}
								disabled={isLoading}
							/>
						</div>
						{errors.email && (
							<p className="text-sm text-red-600">{errors.email.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="password" className="text-sm font-medium text-slate-700">
							Password
						</Label>
						<div className="relative">
							<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Enter your password"
								className={`pl-11 pr-11 h-12 bg-white border-slate-300 focus:border-[#0d3b3f] focus:ring-[#0d3b3f]/20 ${errors.password ? 'border-red-300 focus:border-red-500' : ''
									}`}
								{...register('password')}
								disabled={isLoading}
							/>
							<button
								type="button"
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
								onClick={() => setShowPassword(!showPassword)}
								disabled={isLoading}
							>
								{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
							</button>
						</div>
						{errors.password && (
							<p className="text-sm text-red-600">{errors.password.message}</p>
						)}
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox" 
								className="h-4 w-4 text-igudar-primary focus:ring-igudar-primary border-slate-300 rounded"
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
								Remember me
							</label>
						</div>
						<Link
							href="/auth/forgot-password"
							className="text-sm font-medium text-[#0d3b3f] hover:text-[#0d3b3f]/80 transition-colors"
						>
							Forgot password?
						</Link>
					</div>
				</div>

				<Button
					type="submit"
					className="w-full h-12 bg-[#0d3b3f] hover:bg-[#0d3b3f]/90 text-white font-medium rounded-md shadow-md hover:shadow-lg transition-all duration-200"
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-5 w-5 animate-spin" />
							Signing in...
						</>
					) : (
						<>  
							Sign In
							<ArrowRight className="ml-2 h-5 w-5" />
						</>
					)}
				</Button>

				<div className="relative">
					<div className="absolute inset-0 flex items-center">
						<span className="w-full border-t border-slate-300" />
					</div>
					<div className="relative flex justify-center text-xs">
						<span className="bg-white px-2 text-slate-500">Don't have an account?</span>
					</div>
				</div>

				<Link href="/auth/register">
					<Button
						type="button"
						variant="outline" 
						className="w-full h-12 border border-slate-300 hover:border-[#0d3b3f] hover:bg-[#0d3b3f]/5 text-slate-700 hover:text-[#0d3b3f] font-medium rounded-md transition-all duration-200"
					>
						Sign Up
					</Button>
				</Link>
			</form>
		</div>
	);
};
