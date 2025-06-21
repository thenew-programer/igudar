'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getSession, ensureUserProfile } from '@/lib/auth';
import { User as DatabaseUser } from '@/types/database';

interface AuthContextType {
	user: User | null;
	userProfile: DatabaseUser | null;
	loading: boolean;
	signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [userProfile, setUserProfile] = useState<DatabaseUser | null>(null);
	const [loading, setLoading] = useState(true);


	useEffect(() => {
		let isMounted = true;

		const initializeAuth = async () => {
			try {
				const { session, error } = await getSession();

				if (!isMounted) return;

				if (error) {
					console.error('Error getting initial session:', error);
					setUser(null);
					setUserProfile(null);

					if (typeof window !== 'undefined' &&
						!window.location.pathname.includes('/auth/login') &&
						!window.location.pathname.includes('/auth/register')) {
						window.location.href = '/auth/login';
					}
					return;
				}

				const authUser = session?.user || null;
				setUser(authUser);

				if (authUser) {
					const profile = await ensureUserProfile(authUser);
					if (isMounted) {
						setUserProfile(profile);
					}
				} else {
					setUserProfile(null);
				}
			} catch (error) {
				console.error('Error getting initial session:', error);
				if (isMounted) {
					setUser(null);
					setUserProfile(null);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		initializeAuth();

		const { data: { subscription } } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				if (!isMounted) return;

				setLoading(true);

				try {
					const authUser = session?.user || null;
					setUser(authUser);

					if (event === 'SIGNED_OUT') {
						setUserProfile(null);
						if (typeof window !== 'undefined' &&
							!window.location.pathname.includes('/auth/login') &&
							!window.location.pathname.includes('/auth/register')) {
							window.location.href = '/auth/login';
						}
					} else if (authUser) {
						const profile = await ensureUserProfile(authUser);
						if (isMounted) {
							setUserProfile(profile);
						}
					} else {
						setUserProfile(null);
					}

					switch (event) {
						case 'SIGNED_IN':
							console.log('User signed in:', session?.user?.email);
							break;
						case 'SIGNED_OUT':
							console.log('User signed out');
							break;
						case 'TOKEN_REFRESHED':
							console.log('Token refreshed');
							break;
						case 'USER_UPDATED':
							console.log('User updated');
							break;
					}
				} catch (error) {
					console.error('Error in auth state change:', error);
				} finally {
					if (isMounted) {
						setLoading(false);
					}
				}
			}
		);

		return () => {
			isMounted = false;
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		const handleVisibilityChange = async () => {
			if (document.visibilityState === 'visible' && user) {
				console.log('Tab is visible, refreshing session...');
				try {
					await supabase.auth.getSession();
				} catch (error) {
					console.error('Error refreshing session on visibility change:', error);
				}
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [user]);

	const handleSignOut = async () => {
		try {
			setLoading(true);
			const { error } = await supabase.auth.signOut();
			if (error) {
				console.error('Sign out error:', error);
			} else {
				if (typeof window !== 'undefined') {
					window.location.href = '/auth/login';
				}
			}
		} catch (error) {
			console.error('Sign out error:', error);
		} finally {
			setLoading(false);
		}
	};

	const value: AuthContextType = {
		user,
		userProfile,
		loading,
		signOut: handleSignOut,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};
