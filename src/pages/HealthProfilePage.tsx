import React from 'react';
import HealthProfile from '@/components/patient/HealthProfile';
import MainLayout from '@/components/layouts/MainLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const HealthProfilePage: React.FC = () => {
  return (
    <ProtectedRoute requiredRole="patient">
      <MainLayout>
        <HealthProfile />
      </MainLayout>
    </ProtectedRoute>
  );
};

export default HealthProfilePage;