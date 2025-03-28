'use client';

import { Suspense } from 'react';
import Layout from '../../components/layout';
import DashboardContent from '../../components/DashboardContent';

// Add export const dynamic to force dynamic rendering instead of static prerendering
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Layout title="Dashboard - headcraftAI">
        <DashboardContent />
      </Layout>
    </Suspense>
  );
}