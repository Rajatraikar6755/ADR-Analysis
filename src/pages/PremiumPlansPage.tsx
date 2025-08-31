
import React from 'react';
import PremiumPlans from '@/components/subscription/PremiumPlans';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const PremiumPlansPage: React.FC = () => {
  return (
    <ProtectedRoute>
      <MainLayout>
        <PremiumPlans />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default PremiumPlansPage;
