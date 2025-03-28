'use client';

import { Suspense } from 'react';
import { useUser } from '@stackframe/stack';
import Layout from '../../components/layout';
import DashboardContent from '../../components/DashboardContent';

// Use dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';
export const runtime = 'edge'; // Skip prerendering at build time

export default function DashboardPage() {
  const user = useUser();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout title="Dashboard - headcraftAI" user={user}>
        <DashboardContent />
      </Layout>
    </Suspense>
  );
} 