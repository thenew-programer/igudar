'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// This page now redirects to the main properties page
// Property details are handled by the PropertyModal component
export default function PropertyDetailsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/properties');
  }, [router]);

  return null;
}