import { Metadata } from 'next';
import { Suspense } from 'react';
import HomeContent from '../components/HomeContent';

// Add dynamic rendering to avoid CSS prerendering issues
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'headcraftAI | AI-Generated Professional Headshots',
  description: 'Get studio-quality headshots in minutes without a photographer. Upload your photos, and our AI does the rest.',
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
