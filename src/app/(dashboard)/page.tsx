'use client';

// src/app/(dashboard)/dashboard.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import Layout from '../../components/layout';
import DashboardContent from '../../components/DashboardContent';

const Dashboard = () => {
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
    setLoading(false);
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout user={user} loading={loading} title="Dashboard - headcraftAI">
      <DashboardContent user={user} />
    </Layout>
  );
};

export default Dashboard;